// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bolt;

// data

const blocks = {
	T00_06: {
		duration: '22h - 6h',
		weekdays: { ht: 3, lt: 4 },
		weekends: { ht: 4, lt: 5 }
	},
	T06_07: {
		duration: '6h - 7h',
		weekdays: { ht: 2, lt: 3 },
		weekends: { ht: 3, lt: 4 }
	},
	T07_14: {
		duration: '7h - 14h',
		weekdays: { ht: 1, lt: 2 },
		weekends: { ht: 2, lt: 3 }
	},
	T14_16: {
		duration: '14h - 16h',
		weekdays: { ht: 2, lt: 3 },
		weekends: { ht: 3, lt: 4 }
	},
	T16_20: {
		duration: '16h - 20h',
		weekdays: { ht: 1, lt: 2 },
		weekends: { ht: 2, lt: 3 }
	},
	T20_22: {
		duration: '20h - 22h',
		weekdays: { ht: 2, lt: 3 },
		weekends: { ht: 3, lt: 4 }
	},
	T22_24: {
		duration: '22h - 6h',
		weekdays: { ht: 3, lt: 4 },
		weekends: { ht: 4, lt: 5 }
	}
}

const slovenianHolidays = [
	'-01-01', // Novo leto
	'-01-02', // Novo leto
	'-02-08', // Prešernov dan
	'-04-27', // Dan upora proti okupatorju
	'-05-01', // Praznik dela
	'-05-02', // Praznik dela
	'-06-25', // Dan državnosti
	'-08-15', // Marijino vnebovzetje
	'-10-31', // Dan reformacije
	'-11-01', // Dan spomina na mrtve
	'-12-25', // Božič
	'-12-26' // Dan samostojnosti in enotnosti
]

let easterMonday = function(year) {
	let a = year % 19;
	let b = Math.floor(year / 100);
	let c = year % 100;
	let d = Math.floor(b / 4);
	let e = b % 4;
	let f = Math.floor((b + 8) / 25);
	let g = Math.floor((b - f + 1) / 3);
	let h = (19 * a + b - d - g + 15) % 30;
	let i = Math.floor(c / 4);
	let k = c % 4;
	let l = (32 + 2 * e + 2 * i - h - k) % 7;
	let m = Math.floor((a + 11 * h + 22 * l) / 451);
	let month = Math.floor((h + l - 7 * m + 114) / 31);
	let day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(year, month - 1, day + 1);
}

low_tariff_months_start = 3
low_tariff_months_end = 10

let now = new Date();
let hour = now.getHours();
let day = now.getDay();

let holidays = slovenianHolidays.map(holiday => {
	return new Date(now.getFullYear() + holiday)
})
holidays.push(easterMonday(now.getFullYear()))

const isWeekend = day == 0 || day == 6;
const isHoliday = holidays.some(holiday => holiday.getMonth() == now.getMonth() && holiday.getDate() == now.getDate());
const isLowTariff = now.getMonth() >= low_tariff_months_start && now.getMonth() <= low_tariff_months_end;

let current_block_name = Object.keys(blocks).find(block => {
	let start = parseInt(block.split('_')[0].split('T')[1]);
	let end = parseInt(block.split('_')[1]);
	return hour >= start && hour < end;
})

// if it's past 22h, the next block is the first one
let next_block_name = Object.keys(blocks).find(block => {
	let start = parseInt(block.split('_')[0].split('T')[1]);
	return (hour < start) || (hour >= 22 && start === 0);
})

const tariff = isLowTariff ? 'lt' : 'ht';
const current_block = isWeekend || isHoliday ? blocks[current_block_name].weekends[tariff] : blocks[current_block_name].weekdays[tariff];
const next_block = isWeekend || isHoliday ? blocks[next_block_name].weekends[tariff] : blocks[next_block_name].weekdays[tariff];

let widget_data = [
	{ name: "Dummy, just for the index 0" },
	{ name: 'BLOK 1', price: 3.42250, color1: '#ED1D1D' },
	{ name: 'BLOK 2', price: 0.91224, color1: '#F05000' },
	{ name: 'BLOK 3', price: 0.16297, color1: '#FFB03A' },
	{ name: 'BLOK 4', price: 0.00407, color1: '#2D808B' },
	{ name: 'BLOK 5', price: 0.00000, color1: '#2C232B' }
];

let main_section = widget_data[current_block];
main_section.duration = blocks[current_block_name].duration;

let next_section = widget_data[next_block];
next_section.duration = blocks[next_block_name].duration;

function darkenColor(color, percent) {
	const num = parseInt(color.replace("#", ""), 16),
		amt = Math.round(2.55 * percent),
		R = (num >> 16) - amt,
		G = (num >> 8 & 0x00FF) - amt,
		B = (num & 0x0000FF) - amt;
	return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// widget

const widget = new ListWidget();
let nextRefresh = Date.now() + 1000 * 60; // 1 minute
widget.refreshAfterDate = new Date(nextRefresh);

const padding = 16;
widget.setPadding(padding * 2, padding, padding, padding);

const gradient = new LinearGradient()
gradient.locations = [0, 1]

gradient.textcolors = [
	new Color(main_section.color1),
	new Color(darkenColor(main_section.color1, 50))
]
widget.backgroundGradient = gradient

let widgetTestDefaults = function(widgetText) {
	widgetText.centerAlignText();
	widgetText.textColor = Color.white();
	widgetText.shadowColor = new Color("#000000", 0.3);
	widgetText.shadowRadius = 2;
	widgetText.shadowOffset = new Point(2, 2);
	widgetText.minimumScaleFactor = 1;
}

const header = widget.addText(main_section.name);
header.font = Font.boldSystemFont(18);
widgetTestDefaults(header);

const price = widget.addText(main_section.price.toFixed(2) + ' €/kW');
price.font = Font.boldSystemFont(12);
widgetTestDefaults(price);

const duration = widget.addText(main_section.duration);
duration.font = Font.systemFont(12);
widgetTestDefaults(duration);

widget.addSpacer(padding*2);
const line = widget.addText("───────");
line.font = Font.systemFont(12);
widgetTestDefaults(line);

const footer = widget.addText(next_section.name);
footer.font = Font.regularSystemFont(12);
widgetTestDefaults(footer);

Script.setWidget(widget);
Script.complete();
widget.presentSmall();
