# ThunderHug
A call for proposals app that uses Google Spreadsheets to store sessions and
keep out of your way.

## Setup
### Install
Grab yourself a copy of ThunderHug, best bet is to grab the master branch as
this is being kept for working builds ;)

```sh

	$ npm install
	$ cp config.dist.json config.json

```

### Configure
ThudnerHug allows for multiple types of config, however for local development
its easiest to use config.json (created during install).

```json

	{
		// the key for the spreadsheet the data lives in
		"GOOGLE_KEY": "",

		// google account user name so ThunderHug can access protected sheets
	  "GOOGLE_USER": "",

	  // password for google account
	  "GOOGLE_USER_PASS": "",

	  // how often to run checks for new sessions (set to 1hr by default)
	  "POLL_INTERVAL": 3600000,

	  // what column name contains flags indicating public data
	  "PUBLIC_FLAG": "reviewed",

	  // a prefix for redis keys
	  "REDIS_PREFIX": "thunderhug",

		// default port to run on
	  "PORT": 4000
	}

```

**All settings are required** for ThunderHug to run. Make sure these are set
before attempting to run the server.

### Run
In a production environment use `node server.js` however for development you can
launch the server (and relaunch when changes occur) automagically using `grunt`

## Public API

### /api/all
Returns all session proposals that have been reviewed along with metadata about
what possible tracks there are, possible session formats, and how many proposals
have been made so far (inc. unreviewed).

	{
		meta: {
			slug: 'all',
			description: 'A full listing of all proposals submitted',
			totalProposals: 324
		},
		sessions: [
			{
				title: 'Redesigning FireHug for the future.',
				theme: 'Web in your pocket',
				themeSlug: 'mobile',
				facilitators: [
					{
						name: 'William Duyck',
						twitter: '@FuzzyFox0'
					},
					{ ... }
				],
				organization: 'Mozilla Foundation',
				goals: 'Lorem ipsum dolor sit amet...',
				agenda: 'Lorem ipsum dolor sit amet...',
				scale: 'Lorem ipsum dolor sit amet...',
				outcomes: 'Lorem ipsum dolor sit amet...',
				timestamp: '2014-06-12T13:01:42.391Z'
			},
			{ ... }
		],
		themes: [
			{
				name: 'Web in your pocket',
				slug: 'mobile',
				description: 'Lorem ipsum dolor sit amet...',
				totalProposals: 29
			},
			{ ... }
		]
	}

### /api/:track_slug
Returns all session proposals for the given track, along with metadata about the
requested track, all possible session formats, and how many proposals have been
made for this track (inc. unreviewed).

	{
		meta: {
			slug: 'mobile',
			description: 'A full listing of all proposals submitted',
			totalProposals: 29
		},
		sessions: [
			{
				title: 'Redesigning FireHug for the future.',
				theme: 'Web in your pocket',
				themeSlug: 'mobile',
				facilitators: [
					{
						name: 'William Duyck',
						twitter: '@FuzzyFox0'
					},
					{ ... }
				],
				organization: 'Mozilla Foundation',
				goals: 'Lorem ipsum dolor sit amet...',
				agenda: 'Lorem ipsum dolor sit amet...',
				scale: 'Lorem ipsum dolor sit amet...',
				outcomes: 'Lorem ipsum dolor sit amet...',
				timestamp: '2014-06-12T13:01:42.391Z'
			},
			{ ... }
		]
	}

## Deploy (heroku)

```sh

	git push heroku master
	heroku config:set GOOGLE_KEY=''
  heroku config:set GOOGLE_USER=''
  heroku config:set GOOGLE_USER_PASS=''
  heroku config:set POLL_INTERVAL=360000
  heroku config:set PUBLIC_FLAG='reviewed'
  heroku config:set REDIS_PREFIX='thunderhug'

```

## License
This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain
one at <http://mozilla.org/MPL/2.0/>.
