[
	{
		"type": "soldier",
		"location": [2,2],
		"img": "img/blueSoldier.png",
		"baseActionPoints": 3000,
		"types": ["light","bio"],
		"moveMatrix":
		{
			"P": 1000,
			"F": 1500,
			"M": 2000,
			"S": 1500,
			"R": 1000
		},
		"team": "blue",
		"health": 50000
	},
	{
		"type": "soldier",
		"location": [6,6],
		"img": "img/redSoldier.png",
		"baseActionPoints": 3000,
		"types": ["light","bio"],
		"moveMatrix":
		{
			"P": 1000,
			"F": 1500,
			"M": 2000,
			"S": 1500,
			"R": 1000
		},
		"team": "red",
		"health": 50000
	},
	{
		"type": "tank",
		"location": [4,3],
		"img": "img/blueTank.png",
		"baseActionPoints": 5000,
		"types": ["armored","mechanical"],
		"damage": {
			"_base": 500,
			"light": 50
		},
		"moveMatrix":
		{
			"P": 1000,
			"F": 1600,
			"M": 2000,
			"S": 1600,
			"R": 500
		},
		"team": "blue",
		"health": 150000
	}	
]
