const express = require('express')
const app = express()
const entryRouter = express.Router()

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const {passport, authorize} = require('./auth')

const schedule = require('node-schedule')


	//scraps webpage for title
const request = require('request')
const rp = require('request-promise-native')
const cheerio = require('cheerio')
const ImageResolver = require('image-resolver')
const resolver = new ImageResolver();
resolver.register(new ImageResolver.FileExtension());
resolver.register(new ImageResolver.MimeType());
resolver.register(new ImageResolver.Opengraph());
resolver.register(new ImageResolver.Webpage());


entryRouter.use(jsonParser)
entryRouter.use(require('cookie-parser')())
entryRouter.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { secure : false, maxAge : (4 * 60 * 60 * 1000)} }))
entryRouter.use(passport.initialize())
entryRouter.use(passport.session())



const {Users, Entry} = require('./models')

const {addDays, nowDate} = require('./resources/date-module')


entryRouter.get('/', (req, res) => {
	Entry
		.find()
		.exec()
		.then(entries => {
			res.json({
				entries: entries.map(entry => entry.entryRepr())
			})
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})
})

entryRouter.get('/entries', authorize, (req, res) => {
	let user = req.user.userRepr()
	Entry
		.find({journalId: user.journalId})
		.exec()
		.then(entries => {
			if (entries.length == 0){
				res.status(200).json({message: 'You have no links saved'})
			}
			else {
				res.json({
					entries: entries.map(entry => entry.entryRepr())
				})
			}
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})
})



entryRouter.post('/', authorize, (req, res) => {
	const requiredFields = ['link', 'priority'];
	let priorityExpiryObject = {}
	let priority = req.body.priority
	let addDate = nowDate()
	let expiry;
	let	options = {
		    uri: req.body.link,
		    transform: function (body) {
		        return cheerio.load(body);
		    }
		}
	requiredFields.forEach((field) => {
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message)
			return res.status(400).send(message)
		}
	})


		Users
			.find({journalId: req.user.journalId})
			.exec()
			.then(res => {
				priorityExpiryObject = res[0].priorityExpiry
				expiry = addDays(addDate, priorityExpiryObject[priority])
				return expiry
			})
			.then(expiry => {
				if (req.body.title){
					Entry
					.create({
						title: req.body.title,
						link: req.body.link,
						journalId: req.user.journalId,
						priority: req.body.priority,
						addDate: addDate,
						expiry: expiry
					})
					.then(entry => res.status(201).json(entry.entryRepr()))				
				}
				else{
						//scrapes title from url
					rp(options)
						.then(($) => {
							let pageTitle = $('head title').html()

							title = pageTitle.split("-")[0].split('|')[0]
							

							if (title == null || title == ""){
								linkArray = (url).split('/')
								title = linkArray[linkArray.length - 1]
							}
							return title
						})
						.then(title => {

							//scrapes image from url
							resolver.resolve(req.body.link, (result)=>{
								let image;

								if (result == null){
									image = '/resources/images/empty.jpg'
								}
								else {
									image = result.image
								}
								
								Entry
									.create({
										title: title,
										link: req.body.link,
										image: image,
										journalId: req.user.journalId,
										priority: req.body.priority,
										addDate: addDate,
										expiry: expiry
									})
									.then(entry => res.status(201).json(entry.entryRepr()))
									.catch(err => {
										console.error(err)
										return res.status(400).json({message: 'Internal server error'})
									})
								
							})
						})
						.catch(err => {
							console.log('website does not exist')
							return res.status(400).json({message: 'Website does not exist'})
						})
					}
			})
})

entryRouter.put('/:entryId', (req, res) => {

	if (!(req.params.entryId === req.body.entryId)){
		const message = (
		  `Request path entryId (${req.params.entryId}) and request body entryId ` +
		  `(${req.body.entryId}) must match`);
		console.error(message);
		res.status(400).json({message: message});
	}

	let toUpdate = {}
	const updateableFields = ['link', 'priority', 'title']
	let addDate;
	
	updateableFields.forEach(field => {
		if(field in req.body){
			toUpdate[field] = req.body[field]
		}
	})

	if (!("priority" in toUpdate)){
		Entry
			.findByIdAndUpdate(req.body.entryId, {$set: toUpdate}, {new: true})
			.then(updateEntry => res.status(201).json(updateEntry.entryRepr()))
	}

	else {
		let addDate;

		Entry
			.findById(req.body.entryId)
			.exec()
			.then(res => {
				let journalId = res.journalId
				addDate = new Date(res.addDate)
				return journalId
			})
			.then(journalId => {
				Users
					.find({journalId: journalId})
					.exec()
					.then(res => {
						let priorityExpiryObject = res[0].priorityExpiry
						return priorityExpiryObject
					})
					.then(object => {
						let priority = req.body.priority
						let priorityExpiry = object[priority]
						return priorityExpiry
					})
					.then(priorityExpiry => {
						expiry = addDays(addDate, priorityExpiry)
						return expiry 
					})
					.then(expiry => {
						toUpdate.expiry = new Date(expiry)
						Entry
							.findByIdAndUpdate(req.params.entryId, {$set: toUpdate}, {new: true})
							.then(updateEntry => res.status(201).json(updateEntry.entryRepr()))
							.catch(err => res.status(500).json({message: 'Internal server error'}))
					})
				
				})
		}
})


entryRouter.delete('/:entryId', (req, res) => {

	Entry
		.findByIdAndRemove(req.params.entryId)
		.then(() => {
			console.log(`Entry ${req.params.entryId} was deleted`)
			res.status(204).end()
		})
})

entryRouter.delete('/journal/:journalId', (req, res) => {
	Entry
		.find({journalId: req.params.journalId})
		.remove()
		.exec()
		.then(() => {
			console.log(`Journal ${req.params.journalId} was deleted`)
			res.status(204).end()
		})
})

	//schedules delete to run on all expired entries once a day at 11:59 PM
let deleteExpiredPosts = schedule.scheduleJob('45 * * * *', function(){
	let currentDate = nowDate()

	Entry
		.find({expiry: {$lte: currentDate}})
		.exec()
		.then(entries => {
			entries.forEach(entry => {
				let id = entry.id
				Entry
					.findByIdAndRemove(id)
					.exec()
					.then(() => {
						console.log(`${entry.title} deleted`)
					})
			})
		})
		.then(() => {
			console.log('All expired entries have been deleted')
		})
})


module.exports = entryRouter