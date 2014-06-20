# ThunderHug
A call for proposals app that uses Google Spreadsheets to store sessions and
keep out of your way.

## Usage

	// information to come w/ app

### Public API

#### /api/all
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

#### /api/:track_slug
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

	// information to come w/ app

## License
This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain
one at <http://mozilla.org/MPL/2.0/>.
