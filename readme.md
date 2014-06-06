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
			total_proposals: 324
		},
		sessions: [
			{
				name: 'Redesigning FireHug for the future.',
				format: 'Design Challenge',
				track: 'mobile',
				description: 'Lorem ipsum dolor sit amet...',
				proposal_timestamp: '2014-06-12T13:01:42.391Z',
				facilitator: {
					first_name: 'William',
					last_name: 'Duyck',
					organization: 'Mozilla Foundation',
					twitter: '@FuzzyFox0'
				}
			},
			{...}
		],
		formats: [
			{
				name: 'Design Challenge',
				slug: 'design_challenge',
				description: 'Lorem ipsum dolor sit amet...'
			},
			{...}
		],
		tracks: [
			{
				name: 'Mobile WebApps',
				slug: 'mobile',
				description: 'Lorem ipsum dolor sit amet...'
			},
			{...}
		]
	}

#### /api/:track_slug
Returns all session proposals for the given track, along with metadata about the
requested track, all possible session formats, and how many proposals have been
made for this track (inc. unreviewed).

	{
		meta: {
			name: 'Mobile WebApps',
			slug: 'mobile',
			description: 'Lorem ipsum dolor sit amet...',
			total_proposals: 42,
		},
		sessions: [
			{
				name: 'Redesigning FireHug for the future.',
				format: 'Design Challenge',
				track: 'mobile',
				description: 'Lorem ipsum dolor sit amet...',
				proposal_timestamp: '2014-06-12T13:01:42.391Z'
				facilitator: {
					first_name: 'William',
					last_name: 'Duyck',
					organization: 'Mozilla Foundation',
					twitter: '@FuzzyFox0'
				}
			},
			{...}
		],
		formats: [
			{
				name: 'Design Challenge',
				slug: 'design_challenge',
				description: 'Lorem ipsum dolor sit amet...'
			},
			{...}
		]
	}

#### /api/:format_slug
Returns all session proposals for the given format, along with metadata about the
requested format, all possible tracks, and how many proposals have been made for
this format (inc. unreviewed).

	{
		meta: {
			name: 'Design Challenge',
			slug: 'design_challenge',
			description: 'Lorem ipsum dolor sit amet...',
			total_proposals: 23,
		},
		sessions: [
			{
				name: 'Redesigning FireHug for the future.',
				format: 'Design Challenge',
				track: 'mobile',
				description: 'Lorem ipsum dolor sit amet...',
				proposal_timestamp: '2014-06-12T13:01:42.391Z'
				facilitator: {
					first_name: 'William',
					last_name: 'Duyck',
					organization: 'Mozilla Foundation',
					twitter: '@FuzzyFox0'
				}
			},
			{...}
		],
		tracks: [
			{
				name: 'Mobile WebApps',
				slug: 'mobile',
				description: 'Lorem ipsum dolor sit amet...'
			},
			{...}
		]
	}

## Deploy (heroku)

	// information to come w/ app

## License
This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain
one at <http://mozilla.org/MPL/2.0/>.
