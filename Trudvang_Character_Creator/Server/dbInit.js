import mongoose from "mongoose";
import 'dotenv/config';
import { Origin, Archetype, Skill, Equipment } from './models/index.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trudvang_db';

// ---- ORIGINS (from Trudvang Chronicles Player's Handbook) ----
//  Race -> Culture Structure: 
//  Body Points and Max Movement are predetermined
//    Human: BP 32, Move 10 (Stormlanders | Mittlanders | Viraans | Wildfolk)
//    Elf: BP 30, Move 12 (Korpikalli, Illmalaini)
//    Dwarf: 
//      Buratja: BP 28, Move 8
//      Borjornikkas: BP 30, Move 8
//  BP is further modified by Con + Str traits; Movement by Dex trait, at char creation
const originData = [
  // Hummans
  {
    race: 'Human', culture: 'Stormlanders',
    description: 'The main folk of the east, tall and strong, shaped by the harsh wilderness. Most have dark hair and black eyes; those from Ejdland are blond with blue eyes. Occassionally one bears yellow eyes, said to be a heritage from living alongside trolls and dark breeds.',
    bodyPoints: 32, maxMovement: 10
  },
  {
    race: 'Human', culture: 'Mittlanders',
    description: 'Descendants of the ancient Thronelanders, also known as East-throners. Proud and honorable people who value courage above all virtues. Not as tall or strong as Stormlanders, but respected throughout Trudvang for their stamina and endurance.',
    bodyPoints: 32, maxMovement: 10
  },
  {
    race: 'Human', culture: 'Viraans',
    description: 'the humans of the far west are called Viraans. Typically blond with gray or dark brown eyes, they are not know for great strength or constitution but are renowned for wisdom and knowledge. Since settling and learning agriculture, Viranns have valued the pursuits of learning above strength and war.',
    bodyPoints: 32, maxMovement: 10
  },
  {
    race: 'Human', culture: 'Wildfolk',
    description: 'A mix of different tribes: Amures in the northwestern mountains, Thoorkaals in the southwest, and savage clans in the northern wilds. Most Wildfolk pray to the dark gods and put their faith in Haminges. Brutal and hardened, renowned for their ferocity in war. Typically smaller and less intelligent than the average Stormlander but notably stronger.',
    bodyPoints: 32, maxMovement: 10
  },
  // Elves
  {
    race: 'Elf', culture: 'Korpikalli',
    description: 'The dark elves who abandoned old traditions to forge a new future in the wild woods. When the gods left, they Korpikalli chose to leave the gods behind as well. They disdain and scorn the abscent deities. Typical Korpikalli have black hair and dark eyes, with bodies shaped by life in the wilderness. They embrace and worship nature with reverance, and are more aggressive than the Illmalaini.',
    bodyPoints: 30, maxMovement: 12
  },
  {
    race: 'Elf', culture: 'Illmalaini',
    description: 'The star elves - highborn and proud, who consider themselves superior to all other races in Trudvang. Their lives are focused on reconnecting with the gods who departed and left them chained to the world without answers. Guardians of ancient secrets and knowledge, they are quite tall with silvery white hair and pale white skin.',
    bodyPoints: 30, maxMovement: 12
  },
  // Dwarves
  {
    race: 'Dwarf', culture: 'Buratja',
    description: 'A rare breed that lives deep in the earth - most have never seen the sun or left their mountains. They have extraordinary stamina and constitution, and pray to their fiery forges as if they were gods. Buratjas value smithing and forging above all else. Their bodies are covered in thick soot and their eyes shine brightly in the dark. They have thick and bushy hair but shorter beards than the Borjornikkas.',
    bodyPoints: 28, maxMovement: 8
  },
  {
    race: 'Dwarf', culture: 'Borjornikkas',
    description: 'The most common dwarves in Trudvang, living in great underground cities and halls. They regularly trade with humans and spend considerable time on the surface. Superstitous and deeply traditional, they share the Illmalaini elves\' reverence for custom and heritage.',
    bodyPoints: 30, maxMovement: 8
  },
];

// ---- SKILLS ----
// 9 base skills, each with Disciplines and Specialties
const skillData = [
  {
    name: 'Agility', category: 'Physical',
    description: 'Used whenever a character performs something demanding with their body — jumping, climbing, handstands, balancing, falling and landing on their feet, leaping away from a runaway horse, or Evading attacks. Also used when driving a wagon or sleigh, canoeing, skiing, or riding. Wearing armor affects all Agility results.',
    maxSV: 10,
    disciplines: [
      { name: 'Battle Maneuver', description: 'Allows access to specialties that improve moving in battle and wearing armor. Level 1-5: SV +1/level. The discipline bonus applies to Evade rolls.',
        specialties: [
          { name: 'Combat Movement', description: 'Level 1-5: special. The character can move 1 meter per level (max 5 m) during battle without spending Combat Points and beyond the maximum movement. After that distance, 2 Combat Points are spent per additional meter.'},
          { name: 'Evade',           description: 'Level 1-5: SV +2/level. The character has perfected dodging attacks without parrying. Costs one action and cannot be combined with any other action. Evade 3 allows dodging up to 2 attacks; Evade 5 allows up to 3 attacks. The player divides total SV (base + discipline + specialty) among the chosen Evade attempts. A character cannot attempt to dodge the same attack more than once, nor parry it.' },
          { name: 'Ironclad',        description: 'Level 1-5: Armor Heft −1/level. The character moves and maneuvers easily in armor. Worn armor is treated as if it has 1 less Heft per level (minimum Heft 1) when determining armor modifiers.' }
        ]
      },
      { name: 'Body Control',     description: 'Develops the ability to duck, climb, land softly after a fall, perform flips, and engage in acrobatic maneuvers. Level 1-5: SV +1/level. Penalties on attacks with the shield hand are reduced by 1 point per level.',
        specialties: [
          { name: 'Ambidexterity',               description: 'Level 1-5: SV +2/level. Improves fighting with the shield hand. Penalties on shield-hand attacks are reduced by 2 points per level. Combined with maxed Body Control discipline, the full −15 shield-hand penalty is completely nullified.' },
          { name: 'Jestering',                   description: 'Level 1-5: SV +2/level. The character has learned to perform with fire, juggling, and other jester tricks — breathing fire, pulling hands through flame, and juggling. Add +2 SV per level when the GM requires a relevant Skill roll.' },
          { name: 'Jumping, Climbing & Balancing', description: 'Level 1-5: SV +2/level. The character can leap up to 2 m + 1 m per level in length (max 7 m), jump up to 60 cm + 20 cm per level in height (max 1.6 m), and fall up to 3 m + 0.5 m per level (max 6 m) without injury. A successful fall roll also reduces damage dice by one step (3d6→2d6). While balancing, movement is roughly one-third normal; while climbing, one-fifth normal.' },
          { name: 'Swimming',                    description: 'Level 1-5: SV +2/level. Without this specialty the character cannot swim. Grants +2 SV per level and allows movement of 1 m per level per action round in water. The character can hold their breath for 10 action rounds per level (max 50 rounds / ~4 min 10 sec). Can swim in armor up to Heft 1 per level. Staying underwater beyond 3 action rounds requires a Skill roll with cumulative −2 per additional round.' }
        ]
      },
      { name: 'Horsemanship',     description: 'Develops the ability to ride animals and drive a chariot or wagon pulled by four-footed animals. Level 1-5: SV +1/level.',
        specialties: [
          { name: 'Driving Wagon', description: 'Level 1-5: SV +2/level. Develops ability to drive a wagon coupled to one or more draft animals. Skill rolls are normally required only during hunts, chases, or in difficult terrain or weather conditions.' },
          { name: 'Riding',        description: 'Level 1-5: SV +2/level. The character can ride a horse and perform maneuvers on horseback, gaining +2 SV per level for riding fast, jumping, or doing tricks. Each combat round fought on horseback costs 15 Combat Points (−3 per specialty level), so at level 5 there is no extra cost for mounted combat.' }
        ]
      }
    ]
  },
  {
    name: 'Care', category: 'Social',
    description: 'Both administrative and practical: used when the character wants to know how something is handled as well as when they want to manufacture something. It provides insight into how a town, farm, community, or army is managed and controlled — from high-level administration down to hands-on management of a business, farm, or town. The practical side covers various crafts; most characters specialize by acquiring key specialties.',
    maxSV: 10,
    disciplines: [
      { name: 'Handicraft',        description: 'The character is good at building and crafting things. Level 1-5: SV +1/level. Linked to three craft-group specialties: Counterfeiting, Hard Materials, and Soft Materials.',
        specialties: [
          { name: 'Counterfeiting', description: 'Level 1-5: SV +2/level. The character has learned to forge impressive objects that appear as close to the original as possible. The more time spent studying the original, the harder the counterfeit is to detect. The character must also have the specialty appropriate to the material used.' },
          { name: 'Hard Materials', description: 'Level 1-5: SV +2/level. The character has learned to make and repair items of hard materials such as stone, metal, wood, and bone. A successful Skill roll restores 2 Breach Value per level of specialty per hour of work.' },
          { name: 'Soft Materials', description: 'Level 1-5: SV +2/level. The character has learned to make and repair items of soft materials such as clothing, fur, and leather. A successful Skill roll restores 2 Breach Value per level of specialty per hour of work.' }
        ]
      },
      { name: 'Handler',           description: 'The character has learned management and administration in various forms — from controlling a village or town to planning wars and campaigns. The Handler knows why taxes are needed, who runs the administration, and what each authority does. Level 1-5: SV +1/level.',
        specialties: [
          { name: 'Commander', description: 'Level 1-5: SV +2/level. The character is proficient in the management of armies and warfare — moving troops, keeping them entertained, and deciding what defenses to build. Covers everything connected with managing armies and waging war.' },
          { name: 'Sage',      description: 'Level 1-5: SV +2/level. The character has gained great insight into the management and administration of a city or country. They may be involved in solving the city\'s or country\'s problems and advising those in power.' }
        ]
      },
      { name: 'Healing and Drugs', description: 'Teaches the character to mend and care for the sick and wounded so they recover faster than normal, and also to impair others through drugs and poisons. Level 1-5: SV +1/level. Using only discipline knowledge (no specialty) stops blood flow and prevents further damage. One of the underlying specialties is required to actively heal injuries or illnesses.',
        specialties: [
          { name: 'Extracts & Potions',   description: 'Level 1-5: SV +2/level. The character has learned what substances cause the body to react in certain ways, how to prepare extracts, and what happens to those exposed to them. They can recognize a specific extract by taste, smell, appearance, or effect, determine the appropriate antidote, and apply substances to restore body balance and speed healing. Everything from diseases to broken limbs and wounds counts as an injury for this specialty.' },
          { name: 'First Aid & Nursing',  description: 'Level 1-5: SV +2/level. The character has learned to care for injuries. Treated within ten minutes: heals 1 Body Point per level of specialty (only if the injury caused BP damage). Treated after ten minutes: augments the patient\'s Natural Healing rate by +1 BP per level instead. The patient must lie still and receive treatment within one day, before night sleep. The healer must spend at least two hours per attempt.' }
        ]
      },
      { name: 'Tradesman',         description: 'The character has learned to operate a farm, inn, barber shop, or other service trade. They also know who to bribe when something needs to be smuggled or how to evade taxes. Level 1-5: SV +1/level.',
        specialties: [
          { name: 'Barber',  description: 'Level 1-5: SV +2/level. The character has learned to cut and shave hair, and also to pull out troublesome teeth.' },
          { name: 'Brewer',  description: 'Level 1-5: SV +2/level. The character has learned to prepare delicious drinks — from mead and wine to the strongest of spiced spirits.' },
          { name: 'Cook',    description: 'Level 1-5: SV +2/level. The character has learned how to cook good food.' },
          { name: 'Peasant', description: 'Level 1-5: SV +2/level. The character knows when and how to carry out animal care or trade in a farm\'s goods. They know what it takes for a farm to survive the winter and are well versed in the daily tasks of agricultural life.' },
          { name: 'Trader',  description: 'Level 1-5: SV +2/level. The character has learned where to buy goods cheaply and sell them at a higher price elsewhere. They know applicable taxes, transportation costs, which items can be sold and where, who should be bribed, and what papers are required for admission to a town. They can also appraise objects and estimate what they could fetch elsewhere.' }
        ]
      }
    ]
  },
  {
    name: 'Entertainment', category: 'Social',
    description: 'Covers all kinds of entertainment. A person with this skill has learned the rules for gambling and social games and can take part in such activities. They can sing common songs or tell of an event or legend with a skill great enough to spellbind an audience. The person can perform common dances and act or pretend to be others, including dressing up in costume to increase the authenticity of their performance.',
    maxSV: 10,
    disciplines: [
      { name: 'Gambling',          description: 'The character has learned to play cards, stone, dice, and other forms of gambling, often for profit. The discipline provides knowledge of the most common and best-known games in Trudvang. Level 1-5: SV +1/level on gambling Skill rolls.',
        specialties: [
          { name: 'Cheater',          description: 'Level 1-5: SV +2/level. The character has learned different tricks to cheat in games. The cheating player decides the size of the positive modifier (max +10) added to the Skill roll. On success, the GM determines whether the opponent spots the cheat based on circumstances and skill level — opponents may roll Shadow Arts (or Gambling discipline/Cheater specialty, whichever is higher) to see through it. If the cheater\'s Skill roll fails, the opponent gains the same positive modifier that the cheater used.' },
          { name: 'Game Strategist',  description: 'Level 1-5: SV +2/level. The character is good at seeing the smartest moves in strategic games such as Koke\'s Boxes, Bultconan, and Ship on Fire. Add +2 SV per level when playing a strategic game of any kind.' },
          { name: 'Great Gambler',    description: 'Level 1-5: SV +2/level. The character is an accomplished gambler who knows how game rules work and how much and when to invest to win as much as possible. Add +2 SV per level when playing games. The specialty is effective only if the game has a stake.' }
        ]
      },
      { name: 'Music and Dancing',  description: 'Gives the character the ability to entertain others through music. The character can sing, dance, and play instruments, as well as use many narrative techniques. Level 1-5: SV +1/level.',
        specialties: [
          { name: 'Dance',                         description: 'Level 1-5: SV +2/level. The character knows how to dance and can add +2 SV per level when trying to capture an audience\'s interest through dance.' },
          { name: 'Singing & Playing Instruments', description: 'Level 1-5: SV +2/level. The character has a good voice that can captivate an audience and can play music on most of Trudvang\'s instruments. Add +2 SV per level when singing or playing instruments.' }
        ]
      },
      { name: 'Storytelling',       description: 'The character has learned the art of storytelling — how to speak and act to evoke a certain mood among listeners. They can, without much preparation, come up with a story about anything or tell epic legends. Level 1-5: SV +1/level.',
        specialties: [
          { name: 'Acting', description: 'Level 1-5: SV +2/level. The character has learned to express feelings in such a poignant manner that every observer understands what they feel. By speaking mournfully they can make listeners gloomy; by speaking inspiringly they can rally others.' },
          { name: 'Libel',  description: 'Level 1-5: SV +2/level. The character can tell a false and undermining story about someone, often using a real event twisted to make the victim look bad. On success, the speaker can make a crowd disapprove of the intended victim.' }
        ]
      }
    ]
  },
  {
    name: 'Faith', category: 'Spiritual',
    description: 'Knowledge of a race\'s religion and how a faithful servant must behave to call on the gods\' powers. Main religions: Gerbanis, the Eald Tradition, the Tenets of Nid, and Haminges (humans); Thuuldom (dwarves only); Toikalokke (elves only). A character can learn divine powers for only one chosen religion. Half-breeds must choose one religion and count as the race associated with it. The character\'s Faith SV equals their base Divinity Points (Divine Capacity = Faith SV + Divinity Points from Divine Power discipline and specialties). Only the unmodified Faith SV feeds into Divinity Points — bonuses from Invoke or other disciplines do not. Prerequisites to cast divine powers: Faith skill, Divine Power discipline, Invoke discipline + one religion specialty, and at least one Holy Tablet specialty.',
    maxSV: 10,
    disciplines: [
      { name: 'Divine Power', description: 'Gives the dimwalker the ability to receive power (Divinity Points) from their deity, granting greater divine capacity. Level 1–5: +3 Divinity Points/level. At level 5 the dimwalker gains 15 extra Divinity Points per day. Dwarves receive the same number of Divinity Points but they are consumed as soon as they are inserted into an object.',
        specialties: [
          { name: 'Faithful',  description: 'Level 1–5: +7 Divinity Points/level. The character has delved deeply into religion and gains further divine capacity. Dwarves get +7 Divinity Points per level to insert into an object.' },
          { name: 'Powerful',  description: 'Level 1–5: +7 Divinity Points/level. The dimwalker has learned to draw extra power from the divine source, adding to their divinity capacity. Dwarves get +7 Divinity Points per level to insert into an object.' }
        ]
      },
      { name: 'God Focus',    description: 'Represents deep focus on the religious practices linked with invocation. Level 1–5: special — grants +1 per level on Situation rolls to remain focused while disturbed, and −1 per level on Fatal Failure table rolls.',
        specialties: [
          { name: 'Composed',                   description: 'Level 1–5: SV +2/level. The dimwalker is rarely disturbed when invoking a divine feat. Situation rolls to avoid cancellation from disturbance are modified by +2 per level. Rolls on the Fatal Failure table are reduced by −2 per level.' },
          { name: 'Lightning-Quick Invocation', description: 'Level 1–5: SV +2/level. The dimwalker has learned to invoke a divine feat extra quickly, gaining +2 per level on initiative when invoking.' },
          { name: 'Potent',                     description: 'Level 1–5: special −2/level. The dimwalker\'s divine abilities are extra powerful. When a victim makes a Situation roll to avoid or resist a divine ability, the roll is modified by −2 per level of this specialty.' },
          { name: 'Rigorous',                   description: 'Level 1–5: −2/level on Fatal Failure table, plus Divinity Point conversion. When rolling on the Fatal Failure table, subtract −2 per level. In addition, for each level of the specialty the character can spend 2 Divinity Points to gain a +1 modifier on the Skill roll (e.g. level 3 = up to 6 Divinity Points → +3 on the roll). The character decides how many Divinity Points to spend, up to the limit allowed by the specialty level.' }
        ]
      },
      { name: 'Invoke',       description: 'Gives the faithful the ability to call on their religion\'s divine powers using Holy Tablets. Level 1–5: SV +1/level. To invoke a divine power, the character must also learn one religion specialty below and at least one Holy Tablet specialty. The discipline also allows the faithful to perform religious rituals to summon additional temporary Divinity Points (lost at 1 per day; no new ritual until the current pool is depleted). Each dimwalker may acquire no more Holy Tablets than their Faith SV. Choosing one religion specialty forfeits access to all other religion specialties.',
        specialties: [
          { name: 'Bruid',         description: 'Level 1–5: SV +2/level. The dimwalker has chosen the Eald Tradition and can invoke the Flowras and their ancestors to activate supernatural powers via Eald Tradition Holy Tablets. +2 SV per level for performing blood oaths, which grant additional temporary Divinity Points.' },
          { name: 'Gavlian',       description: 'Level 1–5: SV +2/level. The dimwalker has chosen the Tenets of Nid and can invoke the god Gave to activate supernatural powers via Tenets of Nid Holy Tablets. +2 SV per level for performing prayers, which grant additional temporary Divinity Points.' },
          { name: 'Ihana',         description: 'Level 1–5: SV +2/level. The elf has chosen Toikalokke and can decipher the stars to activate elven divine abilities via Toikalokke Holy Tablets. +2 SV per level for performing stargazing, which grants additional temporary Divinity Points.' },
          { name: 'Noaj',          description: 'Level 1–5: SV +2/level. The dimwalker has chosen Haminges and can invoke spirits to activate supernatural powers via Haminges Holy Tablets. +2 SV per level for stealing victims\' spirits, which grants additional temporary Divinity Points.' },
          { name: 'Thuul Forging', description: 'Level 1–5: SV +2/level. The dwarf has chosen Thuuldom and can create rune-inscribed objects through which to activate the mountain\'s forces via Thuuldom Holy Tablets. +2 SV per level for creating items and runes and inserting Divinity Points. Each Holy Tablet level costs Divinity Points equal to the rune level when inserted; there is no cost to activate the rune once created. Thuul forging applies to all mountain materials, including granite and precious stones.' },
          { name: 'Stormkelt',     description: 'Level 1–5: SV +2/level. The dimwalker has chosen Gerbanis and can invoke the gods to activate supernatural powers via Gerbanis Holy Tablets. +2 SV per level for performing blood gifting, which grants additional temporary Divinity Points.' }
        ]
      }
    ]
  },
  {
    name: 'Fighting', category: 'Combat',
    description: 'A person\'s ability in various forms of combat — from wrestling and fist fights to armed melee and ranged weapons. Every SV point in Fighting equals 1 Combat Point; total Combat Points is called Combat Capacity. Disciplines and specialties can increase combat capacity but many bonus Combat Points are locked to the actions of their source discipline or specialty. Using the shield hand for a secondary weapon or shield incurs a −15 penalty, reduced by Shield Bearer (Fighting) or Body Control/Ambidexterity (Agility). Combat Capacity = SV (Fighting) + Combat Points from specific disciplines and specialties.',
    maxSV: 10,
    disciplines: [
      { name: 'Armed Fighting',    description: 'The character knows how to fight with weapons of all kinds — ranged, melee, and shields. Level 1–5: SV/locked CP +1/level.',
        specialties: [
          { name: 'Bows & Slings',      description: 'Level 1–5: SV/locked CP +2/level. Develops ability to use bows and slings, gaining +2 per level in Skill Value when using a bow or sling.' },
          { name: 'Crossbow',           description: 'Level 1–5: SV/locked CP +2/level. Develops ability to use crossbows, gaining +2 per level in Skill Value on attacks made with crossbows.' },
          { name: '1H Light Weapons',   description: 'Level 1–5: SV/locked CP +2/level. Develops ability to use light weapons held in one hand (e.g. dagger, club), gaining +2 per level in SV. The specialty is tied to a specific hand (right or left). To use one-handed light weapons in each hand, the specialty must be learned twice.' },
          { name: '1H Heavy Weapons',   description: 'Level 1–5: SV/locked CP +2/level. Develops ability to use heavy weapons held in one hand (e.g. arming sword, battle axe), gaining +2 per level in SV. Tied to a specific hand; must be learned twice to use in both hands.' },
          { name: 'Throwing Weapons',   description: 'Level 1–5: SV/locked CP +2/level. Develops ability to throw weapons with fatal accuracy (throwing knives, throwing axes, stones), gaining +2 per level in SV. Tied to a specific hand; must be learned twice to throw with both hands.' },
          { name: 'Shield Bearer',      description: 'Level 1–5: SV/locked CP +2/level. The character has learned to use a shield in battle, gaining +2 Combat Points per level for parries made with the shield (usable only for shield parries). Characters with this specialty do not suffer the usual −15 modifier when performing acts with their shield hand — but only while using the shield.' },
          { name: 'Two-Handed Weapons', description: 'Level 1–5: SV/locked CP +2/level. Develops ability to use two-handed weapons (e.g. two-handed sword, axe), gaining +2 per level in SV. At levels 3 and 5, the character also gains an extra weapon action per round: 3 actions at levels 3–4, 4 actions at level 5.' }
        ]
      },
      { name: 'Battle Experience', description: 'The character has been in battle many times and learned to react, fight, and attempt risky things. Level 1–5: SV/Free CP +1 and +1 initiative/level. The bonus Combat Point per level is free (usable for any combat action, like the base Fighting CP).',
        specialties: [
          { name: 'Armor Bearer',     description: 'Level 1–5: Heft +2/level. The character has learned to wear armor in battle, allowing armor with a Heft Value of up to 2 per level (e.g. level 3 allows Heft up to 6).' },
          { name: 'Combat Actions',   description: 'Level 1–5: SV/locked CP +2/level. Allows the character to perform non-attack/non-parry combat actions almost effortlessly — drawing weapons, standing up, combat movement, etc. Grants +2 Combat Points per level usable only for such actions.' },
          { name: 'Combat Reaction',  description: 'Level 1–5: +2 initiative/level. The character has learned to react quickly in battle, gaining +2 per level in combat initiative.' },
          { name: 'Crossbow Loader',  description: 'Level 1–5: special. Allows the character to load their crossbow faster. Loading time is reduced by −1 per level, to a minimum of 1 action round.' },
          { name: 'Fighter',          description: 'Level 1–5: SV/locked CP +2/level. The character has extensive battle experience and gains +2 Combat Points per level to distribute on attacks and parries during a combat round.' }
        ]
      },
      { name: 'Unarmed Fighting',  description: 'Teaches the character to battle without weapons. Level 1–5: SV/locked CP +1/level. Grants +2 Combat Points per level to use when performing the acts described by the following specialties.',
        specialties: [
          { name: 'Brawling',   description: 'Level 1–5: SV/locked CP +2/level. The character has learned to punch and kick hard and to defend against both armed and unarmed attacks using only their body. Gains +2 Combat Points per level to distribute on punches, kicks, and unarmed parries.' },
          { name: 'Wrestling',  description: 'Level 1–5: SV/locked CP +2/level. The character has learned to wrestle and perform grapple and glima combat actions. Gains +2 Combat Points per level for grapple and glima actions. Per grapple rules: 2 CP produces 1 SV for the attacker (e.g. 20 CP = SV 10); breaking free costs 3 CP per SV. Total Wrestling SV cannot exceed the sum of Fighting SV + Unarmed Fighting discipline + Wrestling specialty.' }
        ]
      }
    ]
  },
  {
    name: 'Knowledge', category: 'Intellectual',
    description: 'Provides information about a variety of academic subjects obtained mainly through study and learning — history, culture, and communication. The person has learned about different cultures and gained insight into their history, customs, governance, warfare, gestures, taboos, ceremonies, festivals, gods, clothing, housing, attributes, and hobbies.',
    maxSV: 10,
    disciplines: [
      { name: 'Culture Knowledge', description: 'Covers most things relating to a race\'s culture, religion, history, and legends — way of life, feasts, laws, and background. Level 1–5: SV +2/level. A character begins with level 1 of this discipline for the culture they originate from. Cultures include: Stormlanders, Mittlanders, Viranns, Wildfolk, Dwarves, and Elves.',
        specialties: [
          { name: 'Customs & Laws',  description: 'Level 1–5: SV +2/level. Specification required (choose one culture). The character knows all about a culture\'s laws, legal systems, customs, gestures, taboos, food habits, rules of conduct, typical dress and housing, and common attributes, personalities, and appearances. Add +2 SV per level when learning about that people\'s customs. Focuses on a single culture: Stormlanders, Mittlanders, Viranns, Wildfolk, Dwarves, or Elves.' },
          { name: 'Lore & Legends',  description: 'Level 1–5: SV +2/level. Specification required (choose one culture). The character knows a lot about a specific culture\'s history, myths, and legends. Add +2 SV per level when learning about the chosen race\'s history. Focuses on a single culture: Stormlanders, Mittlanders, Viranns, Wildfolk, Dwarves, or Elves.' },
          { name: 'Religion',        description: 'Level 1–5: SV +2/level. Specification required (choose one culture). Covers how a culture\'s religion works — what gods exist and what they stand for, how the faithful live, their feasts, and the religion\'s history. Add +2 SV per level when learning about a people\'s religion. Focuses on a single culture: Stormlanders, Mittlanders, Viranns, Wildfolk, Dwarves, or Elves.' }
        ]
      },
      { name: 'Language',           description: 'Develops the character\'s ability to express themselves in a specific language — starting with their Mother Tongue. Human languages: Vrok (spoken in Nhoordland, the Stormlands, and parts of Mittland/Soj) and Rona (spoken in Westmark, Soj, and parts of Mittland). Mittlanders may choose either; followers of the Tenets of Nid always speak Rona. Other languages: Eika (elves), Futhark (dwarves), Bastjumal (trolls and giants). A character cannot read or write until they acquire the Reading and Writing specialty. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Bribery',        description: 'Level 1–5: SV +2/level. The character has learned to gauge how people react to bribes — whether someone can be bribed, how it should be delivered, and how much is necessary. Add +2 SV per level when trying to bribe someone.' },
          { name: 'Calculate',      description: 'Level 1–5: SV +2/level. The character has learned to make difficult calculations and solve mathematical problems using addition, subtraction, multiplication, and percentages. Add +2 SV per level when making a calculation.' },
          { name: 'Foreign Tongue', description: 'Level 1–5: SV +2/level. Specification required (choose one language). Can be purchased multiple times, each for a different foreign language. Some languages require a certain level of the Language discipline even for the first level of this specialty due to difficulty.' },
          { name: 'Mother Tongue',  description: 'Level 1–5: SV +2/level. Specification required (choose language). All characters begin speaking their Mother Tongue fluently (equivalent to Mother Tongue specialty level 3).' },
          { name: 'Read & Write',   description: 'Level 1–5: SV +2/level. Specification required (choose one language). Enables reading and writing texts in the selected language. Can be purchased multiple times for different languages. A character must have the Foreign Tongue specialty for the selected language before learning to read and write it.' },
          { name: 'Silver Tongue',  description: 'Level 1–5: SV +2/level. Allows the character to speak with formal and technical words in complex sentences and to quickly and convincingly fabricate untruths, large or small. Add +2 SV per level when making a Skill roll for lying or using eloquence for persuasion.' }
        ]
      },
      { name: 'Learning',           description: 'Gives the character education and extensive knowledge in a specific chosen subject — anything from swords and literature to kings, demons, or symbols. The discipline has an infinite number of specialties, each a specific subject. The SV modifier from the discipline applies only to specialties the character has learned. The Geography discipline and its specialties from the Wilderness skill can also be treated as theoretical knowledge learned through study rather than experience. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Insight', description: 'Level 1–5: SV +2/level. Specification required (choose one subject). The character knows a lot about a particular chosen subject and can add +2 SV per level when trying to learn about it.' }
        ]
      },
      { name: 'Race Knowledge',     description: 'Gives knowledge about Trudvang\'s different and exotic races — trollkin, wyrms (dragonbeasts), serguronts (ancient spirits), salhele (undead), and more — including their ideologies, governance, lifestyle, fears, strengths, and weaknesses. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Monster Lore', description: 'Level 1–5: SV +2/level. Extra knowledge about Trudvang\'s beasts considered more than just animals — trolls, jotuns, tursirs (giants), wurms (dragons), and other intelligent creatures. Covers their ideologies, governance, lifestyle, fears, strengths, and weaknesses. Add +2 SV per level when learning about such creatures.' },
          { name: 'Spirit Lore',  description: 'Level 1–5: SV +2/level. Extra knowledge about the undead, spirits, mist creatures, demons, and similar entities — their ideologies, governance, lifestyle, fears, strengths, and weaknesses. Add +2 SV per level when learning about such entities.' }
        ]
      }
    ]
  },
  {
    name: 'Shadow Arts', category: 'Stealth',
    description: 'Used whenever a character wants to do something in secret — sneaking, picking locks, following someone, hiding oneself or an object. Not just for thieves, spies, and assassins but also hunters. A higher SV means better hiding, silent movement, and avoiding detection in any environment. A person with high Shadow Arts also more easily spots hidden things, hears whispered conversations, and uses smell, taste, and touch effectively. Equipment (lockpicks, soft shoes, dark garments) can add GM-determined modifiers. When Shadow Arts uses oppose each other (e.g. Finding & Spotting vs. Camouflage & Hiding), the GM is the final arbiter.',
    maxSV: 10,
    disciplines: [
      { name: 'Shadowing', description: 'Used when a person wants to go unnoticed, sneak up on someone, hide, or cause someone to look the other way. Also covers spotting or finding hidden things. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Camouflage & Hiding',  description: 'Level 1–5: SV +2/level. The character knows how to make objects blend into surroundings — large items like tents, rowboats, wagons, and smaller items like traps, chests, swords, and books — as well as hiding themselves or other people. Primarily used outdoors (tall grass, shrubbery, trees) but also applies in caves and rooms.' },
          { name: 'Finding & Spotting',   description: 'Level 1–5: SV +2/level. Gives the character a trained eye to notice hidden things beyond the first glance — people and creatures sneaking or hiding, cleverly concealed objects in buildings or terrain, a hidden poison thorn in a drawer, a stashed object, a floor trap, a secret door. May allow spotting rolls even when not actively searching, at the GM\'s discretion.' },
          { name: 'Sneak Attack',         description: 'Level 1–5: SV +2/level. When the character has successfully used Camouflage & Hiding or Walking in Shadows to sneak up on a target, they can launch a Sneak Attack using melee weapons only (not ranged). The attack hits automatically and deals an additional open roll of damage regardless of the first roll\'s result, plus 2 extra points of damage per level of Sneak Attack. Applies only to that single attack; the attacker is detected afterward. If the Walking in Shadows roll fails beforehand, the character is discovered and combat starts normally with no sneak attack.' },
          { name: 'Walking in Shadows',   description: 'Level 1–5: SV +2/level. The character has learned to sneak without being detected — stepping to minimize noise and moving through shadows, brush, wilderness, and crowds. Movement is limited to half maximum movement when trying to remain hidden, and only 20% of maximum movement when also trying to remain silent.' }
        ]
      },
      { name: 'Thievery',  description: 'Enables the character to get into locked places and steal items from locations or people. They also know the hidden signs of the underworld that criminals use to communicate. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Disguise',      description: 'Level 1–5: SV +2/level. The character is good at dressing up convincingly and mimicking people. With the right accessories, they can blend into any environment. By changing both body language and speech, they can impersonate another person (including the opposite sex) convincingly enough to fool those unfamiliar with the target. Fooling a close friend requires a very good disguise. Add +2 SV per level when trying to blend in.' },
          { name: 'Locks & Traps', description: 'Level 1–5: SV +2/level. The character has learned to pick locks and understands most locking mechanisms. Add +2 SV per level. Without this specialty, the character cannot pick locks at all. All locks have a difficulty level set by the GM (basic door: −1; very advanced: −20). Each attempt takes 2 action rounds; success reduces lock difficulty by 2 steps; failure resets it. Multiple failures risk breaking the pick in the lock, making further attempts impossible. The lock opens when difficulty reaches a positive value. Also used to build traps and to carefully examine and disarm traps without triggering them.' },
          { name: 'Shadow World',  description: 'Level 1–5: SV +2/level. The character has learned the ways of the shadow world — how to obtain counterfeits and contracts, receive and send information that enables better thefts, and find and use black markets.' },
          { name: 'Stealing',      description: 'Level 1–5: SV +2/level. The character has learned the basics of stealing items from other people. Add +2 SV per level. Anyone present when the theft occurs may make a Situation roll (set by the GM) or a Shadow Arts (Finding & Spotting) Skill roll to notice the theft.' },
          { name: 'Thief Signs',   description: 'Level 1–5: SV +2/level. The character can read and create thief signs — symbols carved on house foundations or gateposts, stones laid in patterns, and other markings invisible to the uninitiated. Signs convey layered information: a main message (e.g. guards present) plus one or more specifics (e.g. how many guards, best escape route, hidden passages, wealth of residents). A character with this specialty can read and create signs with two or three additions to the main message, such as "murderous guards here," "fourth plank cracks," or "10 shifts of guards."' }
        ]
      }
    ]
  },
  {
    name: 'Vitner Craft', category: 'Magical',
    description: 'Knowledge of vitner — the energy used in spells — covering its history, written symbolic language, three forms, and the ways to draw it out and direct it. There is no real perception of vitner before reaching Vitner Craft SV 4, learning the first level of the Call of Vitner discipline, and taking one of the three specialties Hwitalja, Vaagritalja, or Darkhwitalja. A conjurer\'s starting Vitner Points equal the unmodified Vitner Craft SV; total Vitner Points is called Vitner Capacity. Other disciplines/specialties that raise Vitner Craft SV (e.g. Vitner Shaping) do not increase Vitner Points. Vitner Capacity = SV (Vitner Craft) + vitner capacity from Call of Vitner discipline and its specialties. Prerequisites for weaving: Vitner Craft SV 4, Call of Vitner discipline + 1 specialty (Hwitalja, Darkhwitalja, or Vaagritalja), Vitner Shaping discipline + at least 1 specialty (Galding, Sejding, or Vyrding), and at least 1 Vitner Tablet specialty.',
    maxSV: 10,
    disciplines: [
      { name: 'Call of Vitner',  description: 'The first step to seeing and calling the vitner and receiving Vitner Capacity. Level 1–5: +5 Vitner Points/level. The character must also learn one of the specialties Hwitalja, Darkhwitalja, or Vaagritalja to use the Vitner Points the discipline provides. Seeing the vitner is a long process described in the Weavers of Vitner chapter.',
        specialties: [
          { name: 'Hwitalja',     description: 'Level 1–5: +10 Vitner Points/level. After years of study the conjurer has found the purest form of vitner — white vitner — becoming a Hwitalja, one who brings light. Choosing this specialty permanently forfeits access to Vaagritalja and Darkhwitalja. White vitner effects: +10 Vitner Points per level; perfect weave on a roll of 1–2; in case of fatal failure only 1d10 (or 10) is rolled on the fatal magic table. Specific Vitner Tablet descriptions note Hwitalja\'s effects, usually in terms of Vitner Point cost.' },
          { name: 'Darkhwitalja', description: 'Level 1–5: +20 Vitner Points/level. The conjurer has found the dark vitner and can summon it, becoming a Darkhwitalja, one of the dark tamers. Choosing this specialty permanently forfeits access to Vaagritalja and Hwitalja. Dark vitner effects: +20 Vitner Points per level; Darkhwitalja can never achieve perfect results due to impure vitner; misses can be fatal — on a fatal failure roll 1d10 (or 8–10) on the fatal magic table. Specific Vitner Tablet descriptions note Darkhwitalja\'s effects, usually in terms of Vitner Point cost.' },
          { name: 'Vaagritalja',  description: 'Level 1–5: +15 Vitner Points/level. The conjurer has found vaagri vitner — a mix of dark and white — becoming a Vaagritalja, a wave master. Choosing this specialty permanently forfeits access to Hwitalja and Darkhwitalja. Vaagri vitner effects: +15 Vitner Points per level; no positive or negative effects on learning, refining, or weaving perfectly; on a fatal failure roll 1d10 (or 9–10) on the fatal magic table. Specific Vitner Tablet descriptions note Vaagritalja\'s effects, usually in terms of Vitner Point cost.' },
          { name: 'Vitner Habit', description: 'Level 1–5: +10 Vitner Points/level. The conjurer has reached an important insight into the vitner art, increasing their ability to draw vitner from their surroundings. Requires at least level 1 in one of Hwitalja, Darkhwitalja, or Vaagritalja. Grants +10 Vitner Points per level.' }
        ]
      },
      { name: 'Vitner Focus',    description: 'The conjurer has learned to focus their mind on vitner energies. Level 1–5: +1/level on Situation rolls to remain focused while disturbed, and −1/level on rolls on the fatal failure table.',
        specialties: [
          { name: 'Potency',     description: 'Level 1–5: −2 special/level. The conjurer\'s spells are very powerful. All Situation values that a victim must roll at or below to resist a spell are reduced by −2 per level. The conjurer also gains +2 per level on their own Situation values to resist or reduce spells directed at them.' },
          { name: 'Safe-weaving', description: 'Level 1–5: −2 special/level. The conjurer is meticulous when weaving spells. When a spell malfunctions, subtract −2 per level from the roll on the fatal magic table. The conjurer is also very hard to disturb during preparation or casting — Situation rolls to avoid cancellation from disturbance are modified by +2 per level.' },
          { name: 'Strenuous',   description: 'Level 1–5: special. The conjurer concentrates especially hard when weaving vitner. By spending extra Vitner Points, the chances of success increase. For each level of this specialty, the conjurer may spend 2 Vitner Points to gain a +1 modifier on the Skill roll (e.g. level 3 allows up to 6 extra Vitner Points for +3; level 5 allows up to 10 for +5). The conjurer decides how many to spend, up to the limit allowed by the specialty level.' }
        ]
      },
      { name: 'Vitner Shaping',  description: 'Vitner can be shaped through three methods: songs and sounds (Galding), gestures (Sejding), and thoughts (Vyrding). This discipline grants modifiers to all three but the conjurer must know at least one related specialty to cast a spell. The three methods cannot be combined — a spell is Galded, Sejded, or Vyrded. The discipline also provides knowledge of the written language of the incantation arts. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Galding',      description: 'Level 1–5: SV +2/level. The conjurer weaves and shapes vitner entirely through mysterious songs and sounds — some long and complex, others a single sustained tone. Songs are highly individual; the same spell may sound completely different for each conjurer. Some use instruments alongside voice. Galding can often be heard from afar, making the conjurer easily detected.' },
          { name: 'Sejding',      description: 'Level 1–5: SV +2/level. The conjurer molds vitner using different movements and gestures. Both hands must be free for weaving; otherwise the vitner needed for the spell cannot be controlled. This method is quiet but visually conspicuous due to the arm and hand movements required.' },
          { name: 'Vitner Runes', description: 'Level 1–5: SV +1/level. The character has learned to decipher the complicated symbols that make up the vitner craft\'s written language.' },
          { name: 'Vyrding',      description: 'Level 1–5: SV +2/level. The quietest and most inconspicuous method — the conjurer fills themselves with vitner, briefly becoming one with their own being, and molds it purely through thought force. The only outward sign is a near-invisible gesture (a wrist twist, finger flick, or eye wink) as the magic channels out through the body. Downside: shaping vitner via Vyrding takes twice as long as other methods.' }
        ]
      }
    ]
  },
  {
    name: 'Wilderness', category: 'Survival',
    description: 'Gives the character greater knowledge of nature and the ability to survive in the wild. Covers hunting, survival experience, nature awareness, geography, and sea navigation. Survival experience helps when necessities cannot be found — knowing where to find water, which insects, berries, moss, and roots are safe to eat, and how to set up the best protection with available materials.',
    maxSV: 10,
    disciplines: [
      { name: 'Geography',          description: 'Knowledge of what the environment looks like and how it is laid out — interpreting and creating maps, knowing where different places are in relation to each other, and which direction to travel to reach a destination. Level 1–5: SV +1/level. Grants +1 per level on Skill rolls to determine knowledge of an area. Characters begin with level 1 in this discipline and level 1 in Land Knowledge for the country where they grew up. Must specify one country (Westmark, Mittland, the Stormlands, Nhoordland, Muspelheim, or Soj); each country requires its own separate discipline.',
        specialties: [
          { name: 'City Knowledge',             description: 'Level 1–5: SV +2/level. Specification required (choose one city). The character has learned all about a particular city — where the ruler lives and where trading houses, inns, baths, sacred buildings, and other places of interest are located.' },
          { name: 'Land Knowledge',             description: 'Level 1–5: SV +2/level. Specification required (choose one country). The character has knowledge of a country\'s geography and can add +2 per level to their SV when learning about its forests, rivers, lakes, coastlines, mountains, cities, trails, and more. Every country in Trudvang (e.g. Vortland, Wildland, Nojd, etc.) has its own Land Knowledge specialty.' },
          { name: 'Orienteering & Cartography', description: 'Level 1–5: SV +2/level. By comparing famous landmarks and the positions of stars and celestial bodies, the character knows their current location and direction of travel, and can find the quickest route between places. The character has also learned to make maps by observing areas and carefully calculating distance and space. Only areas they have personally visited can be mapped; mapmakers who can also read and write produce much clearer maps.' },
          { name: 'Sea Knowledge',              description: 'Level 1–5: SV +2/level. Specification required (choose one region). The character is familiar with the sea surrounding a specific coast, and can add +2 per level to their SV when learning about the seas of that region.' }
        ]
      },
      { name: 'Hunting Experience', description: 'The character knows how to track and hunt prey and how to survive in the wild and difficult environments. They know a lot about different prey — their trails, habits, and behavior — and know the best way to chase prey and fish in different waters. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Carve & Butcher',   description: 'Level 1–5: SV +2/level. The character has learned to carve meat and butcher animals properly, yielding 10% more daily rations than usual through hunting or fishing. The character is also skilled at skinning animals and caring for the fur; the higher the level, the greater and finer the piece of fur obtained. The specialty bonus applies when skinning an animal for its fur.' },
          { name: 'Hunting & Fishing', description: 'Level 1–5: SV +2/level. The character is good at hunting in the wilderness or on a lake and can build and manage hunting traps. The specialty bonus applies when going hunting or fishing.' },
          { name: 'Species Hunter',    description: 'Level 1–5: SV +2/level. Specification required (choose one animal species, e.g. hare, wolf, bear, fox, lynx, wild horse, deer, salmon). The character has learned how and where the chosen animal lives and which tracks to search for when stalking it. The specialty bonus is added to other relevant bonuses (Tracker, Hunting & Fishing, etc.) when tracking the chosen animal and when hunting in areas where the species dwells.' },
          { name: 'Tracker',           description: 'Level 1–5: SV +2/level. The character is good at spotting trails in the terrain. The specialty bonus applies when trying to find or follow a trail.' },
          { name: 'Wilderness Signs',  description: 'Level 1–5: SV +2/level. The character can read and create wilderness signs — symbols carved on tree trunks or gateposts, stones positioned in specific patterns, and other markings invisible to the untrained eye. Signs convey layered information: a main message (e.g. "Beware of trolls") plus detail additions (type of trolls, how many, direction they went, nearby resting places, landslide risk, richness of game, and more). To an experienced person the signs are quite clear, though hidden from everyone else.' }
        ]
      },
      { name: 'Nature Knowledge',   description: 'Gives knowledge of the flora and fauna of Trudvang and the ability to predict the weather. The character knows what plants and animals are in an area, how they behave and why, and is familiar with Trudvang\'s landscapes and terrains. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Animal Friend', description: 'Level 1–5: SV +2/level. Improved knowledge of animal lives, ways, and patterns — used to train animals to perform tricks and activities, and to domesticate wild animals. To domesticate a captured animal, the tamer must succeed on 5 Wilderness Skill rolls (one attempt per week; minimum 5 weeks). The GM determines which animals can be trained and for what. Eight training types exist: fetching, jumping, hunting, couriering, sprinting, tracking, combat, and guarding — each with 5 capability levels (obedient, capable, excellent, skilled, masterful). An animal cannot be trained until first tamed.' },
          { name: 'Botany',        description: 'Level 1–5: SV +2/level. Gives extra knowledge regarding the trees and flowers of Trudvang. The specialty bonus applies when wanting to know something about plants.' },
          { name: 'Weatherman',    description: 'Level 1–5: SV +2/level. The character has learned to interpret the signs of nature and can use them to predict the weather for the next two days +1 additional day per specialty level.' },
          { name: 'Zoology',       description: 'Level 1–5: SV +2/level. Gives extra knowledge about Trudvang\'s creatures that lack higher intelligence — their strengths and weaknesses, how they live, what they fear, and what tracks they make. The specialty bonus applies when wanting to know something about a particular creature.' }
        ]
      },
      { name: 'Seafarer',           description: 'Provides knowledge of the sea and the basics of operating various types of boats — crew composition, cargo loading, ropes and knots, setting sails, sailing and steering. Also covers expected winds in various sea environments and navigational signs on the high seas. Level 1–5: SV +1/level.',
        specialties: [
          { name: 'Navigation', description: 'Level 1–5: SV +2/level. By comparing famous landmarks at sea and the positions of stars and celestial bodies, the character knows their current heading and location and can find the best direct route from one place to another at sea. The GM determines how often a successful Skill roll is required to stay on course based on distance and weather. A good sea map significantly improves accuracy.' },
          { name: 'Seaman',     description: 'Level 1–5: SV +2/level. The character is familiar with spending long periods at sea and does not need to go ashore as often as someone with less experience. The specialty bonus applies when a Skill roll is required to avoid seasickness on stormy waters or for anything related to life on board. The character knows common shipboard routines and chores: setting sail, loading cargo, rigging, and sailing.' }
        ]
      },
      { name: 'Survival',           description: 'Makes the character a true survivor who can subsist on what nature offers. Level 1–5: SV +1/level and +1 Day of Persistence in the wild/level. The discipline bonus applies when the character must survive in the wild and needs to find shelter, food, water, or other necessities.',
        specialties: [
          { name: 'Camper',             description: 'Level 1–5: SV +2/level. The character is good at building camps in the wilderness — not just a one-night camp but one suitable for several days of hunting, equipment repair, or rest. Requires 8 hours of work and a successful Skill roll. A successful camp means inhabitants suffer no negative modifiers for being in the wilderness and can rest and recover from injuries as though in a city. The character can also make fire without a tinderbox or other tools.' },
          { name: 'Pathwalker',         description: 'Level 1–5: SV +2/level. The character has great stamina when traveling in the wild. The specialty bonus applies when a Skill roll is required during long wilderness journeys. The character also increases daily travel distance by 10% per level.' },
          { name: 'Terrain Experience', description: 'Level 1–5: SV +2/level and +2 Days of Persistence in the wild/level for the specific terrain. Specification required (choose one: mountain, forest, sea, arctic, plains, or Muspelheim). The character has great expertise surviving in that terrain. The specialty bonus applies to Skill rolls for finding shelter, food, water, or other necessities in the selected terrain.' },
          { name: 'Weathered',          description: 'Level 1–5: SV +2/level and +2 Days of Persistence in the wild/level. The character is accustomed to spending long periods in the wilderness and can endure rain, wind, and cold. The specialty bonus applies when the character must overcome the weather in the wild.' }
        ]
       }
    ]
  }
];

// ---- EQUIPMENT ----
const equipmentData = [
  // Weapons
  { name: 'Short Sword', category: 'Weapon', damage: '1d6', armor: 0, weight: 1.5, cost: 30 },
  { name: 'Long Sword', category: 'Weapon', damage: '1d8', armor: 0, weight: 2.5, cost: 60 },
  { name: 'Hand Axe', category: 'Weapon', damage: '1d6', armor: 0, weight: 1.0, cost: 15 },
  { name: 'Battle Axe', category: 'Weapon', damage: '1d10', armor: 0, weight: 3.0, cost: 45 },
  { name: 'Spear', category: 'Weapon', damage: '1d8', armor: 0, weight: 2.0, cost: 20 },
  { name: 'Short Bow', category: 'Weapon', damage: '1d6', armor: 0, weight: 1.0, cost: 25 },
  { name: 'Long Bow', category: 'Weapon', damage: '1d8', armor: 0, weight: 1.5, cost: 50 },
  { name: 'Dagger', category: 'Weapon', damage: '1d4', armor: 0, weight: 0.5, cost: 10 },
  // Armor
  { name: 'Leather Armor', category: 'Armor', damage: null, armor: 2, weight: 5.0, cost: 40 },
  { name: 'Chain Mail', category: 'Armor', damage: null, armor: 4, weight: 15.0, cost: 150 },
  { name: 'Plate Armor', category: 'Armor', damage: null, armor: 6, weight: 25.0, cost: 400 },
  { name: 'Hide Armor', category: 'Armor', damage: null, armor: 2, weight: 6.0, cost: 30 },
  // Shields
  { name: 'Round Shield', category: 'Shield', damage: null, armor: 1, weight: 3.0, cost: 20 },
  { name: 'Kite Shield', category: 'Shield', damage: null, armor: 2, weight: 5.0, cost: 50 },
  // Gear
  { name: 'Backpack', category: 'Gear', damage: null, armor: null, weight: 0.5, cost: 5 },
  { name: 'Rope (10m)', category: 'Gear', damage: null, armor: null, weight: 1.0, cost: 5 },
  { name: 'Torch (x3)', category: 'Gear', damage: null, armor: null, weight: 0.5, cost: 3 },
  { name: 'Waterskin', category: 'Gear', damage: null, armor: null, weight: 0.3, cost: 2 },
  { name: 'Healing Herbs', category: 'Gear', damage: null, armor: null, weight: 0.2, cost: 10 },
  { name: 'Rune Stones', category: 'Gear', damage: null, armor: null, weight: 0.5, cost: 25 }
];

// ---- ARCHETYPES ----
const archetypeData = [
  {
    name: 'Bard',
    description: 'Well regarded and sought after all over Trudvang, especially in Mittland. Bards tell stories and sing songs about the past or the future, gathering elders, children, men, and women around the crackling fire to share tales of great heroes, fabulous swords, and mythical creatures.',
    coreSkillNames: ['Entertainment', 'Knowledge'],
    equipmentRestrictions: ['no heavy armor', 'no plate armor']
  },
  {
    name: 'Dimwalker',
    description: 'Dimwalkers live in the name of their god(s). They pray and connect with a divine power to receive special abilities and skills. Stormlanders pray to the Stormasirs, Mittlanders to the spirits of nature, and Viranns to the one god Gave. Common among all dimwalkers is that they devote their lives to a higher power, a belief, and a faith in the divine.',
    coreSkillNames: ['Faith', 'Knowledge'],
    equipmentRestrictions: []
  },
  {
    name: 'Dweller',
    description: 'Dweller is the common name for people living off the land. They settle in a small village or town and use their skills to survive — skilled at agriculture, blacksmithing, and woodcraft. Some have a permanent home; others travel from village to village seeking employment. They collect, produce, sell, and sometimes hunt for survival, and some serve as hirdmen or sellswords in a chieftain\'s guard. Dwellers vary greatly by culture: Stormlanders work as farmhands moving farm to farm and double as hunters; Viranns run large profitable farms and trade widely, with city-dwelling "wall dwellers" selling wares from barrows; Wildfolk dwellers herd reindeer or collect wild herbs, roots, and mushrooms and are especially knowledgeable about flora, fauna, and trading; Mittlanders specialize in agricultural or craft teams and value community above all. Elven dwellers often wander with reindeer herds or stay near wild crops — skilled with bow and fishing rod — though the sedentary Koivhas tend the land without exploiting it. Dwarven dwellers are almost exclusively smiths or miners, occasionally growing mushrooms underground; smiths are highly revered as workers of the great god Borjorn\'s force.',
    coreSkillNames: ['Care', 'Knowledge'],
    equipmentRestrictions: []
  },
  {
    name: 'Ranger',
    description: 'A wanderer of the wilds, a pathfinder, and a hunter. Rangers have learned all the skills needed to live outside villages and towns, and prize most highly a free life in the wilderness. A skilled hunter and scout who can predict weather and track the most fearsome beasts.',
    coreSkillNames: ['Knowledge', 'Wilderness'],
    equipmentRestrictions: ['no plate armor']
  },
  {
    name: 'Rogue',
    description: 'An outcast or vagrant — someone without a king, earl, or chieftain to serve. Rogues live by stealth, murder, or dealing in secrets, always in the shadows. They master picking pockets, burglary, and backstabbing. If not cautious, they may be sacrificed in the moorland or thrown to the wolves.',
    coreSkillNames: ['Knowledge', 'Shadow Arts'],
    equipmentRestrictions: ['no heavy armor', 'no plate armor']
  },
  {
    name: 'Vitner Weaver',
    description: 'To weave the mysterious energy called vitner is a powerful and dangerous trade. Vitner weavers have learned to cast spells and control the powerful vitner. They are rightfully feared all over Trudvang, but also highly respected and valued as advisors, councilors, and wielders of arcane force.',
    coreSkillNames: ['Knowledge', 'Vitner Craft'],
    equipmentRestrictions: ['no heavy armor', 'no plate armor']
  },
  {
    name: 'Warrior',
    description: 'The backbone of an adventuring party. Warriors put faith in their own sword and strength. The fierce berserkers of the Stormlands are respected and feared across Trudvang, as are the holy warriors of the far west. A warrior serves to protect others and to die with sword in hand.',
    coreSkillNames: ['Fighting', 'Knowledge'],
    equipmentRestrictions: []
  }
];

// ---- SEED FUNCTION ----
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName);

    // Clear existing game content
    await Promise.all([
      Origin.deleteMany({}),
      Skill.deleteMany({}),
      Equipment.deleteMany({}),
      Archetype.deleteMany({})
    ]);
    console.log('Cleared existing game content');

    // Insert Origins
    const insertedOrigins = await Origin.insertMany(originData);
    console.log(`Inserted ${insertedOrigins.length} origins`);

    // Insert Skills
    const insertedSkills = await Skill.insertMany(skillData);
    console.log(`Inserted ${insertedSkills.length} skills`);

    // skillMap
    const skillMap = {};
    for (const s of insertedSkills) skillMap[s.name] = s._id;

    // Insert Equipment
    const insertedEquipment = await Equipment.insertMany(equipmentData);
    console.log(`Inserted ${insertedEquipment.length} equipment items`);

    // Insert Archetypes
    const archetypeDocs = archetypeData.map(a => ({
      name: a.name,
      description: a.description,
      coreSkillNames: a.coreSkillNames,
      equipmentRestrictions: a.equipmentRestrictions
    }));
    const insertedArchetypes = await Archetype.insertMany(archetypeDocs);
    console.log(`Inserted ${insertedArchetypes.length} archetypes`);

    console.log('\n - Seed complete. trudvang_db is ready.');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();