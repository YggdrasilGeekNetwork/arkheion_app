export type T20Race = {
  id: string
  name: string
  icon: string
  names: {
    male?: string[]
    female?: string[]
    unisex?: string[]
  }
  surnames?: string[]
}

export const T20_RACES: T20Race[] = [
  {
    id: 'humano',
    name: 'Humano',
    icon: '🧑',
    names: {
      male: ['Aldric', 'Beren', 'Cassiel', 'Dorian', 'Edric', 'Fausto', 'Gareth', 'Henrik', 'Ivan', 'Jonas', 'Kael', 'Lucian', 'Marcus', 'Nikolai', 'Orion', 'Rafael', 'Stefan', 'Tobias', 'Victor', 'Willem'],
      female: ['Aelina', 'Brenna', 'Celeste', 'Diana', 'Elena', 'Freya', 'Giselle', 'Helena', 'Iris', 'Joana', 'Katarina', 'Liana', 'Maren', 'Natasha', 'Ophelia', 'Petra', 'Rosa', 'Selene', 'Thalia', 'Viviane'],
    },
    surnames: ['Valente', 'Ferroforte', 'da Costa', 'Monteiro', 'Tormenta', 'Lobo', 'Águia', 'Pedreira', 'Corvo', 'Lâmina', 'Trovão', 'Estrela', 'Silveira', 'Bravo', 'Castelo'],
  },
  {
    id: 'anao',
    name: 'Anão',
    icon: '⛏️',
    names: {
      male: ['Balin', 'Dvalin', 'Thorin', 'Gimrik', 'Brokk', 'Durin', 'Farin', 'Gundrik', 'Haldor', 'Korgrim', 'Mordak', 'Nori', 'Ottar', 'Rurik', 'Snorri', 'Thrain', 'Ulrik', 'Vondal'],
      female: ['Brynhild', 'Dagny', 'Eira', 'Freja', 'Gerta', 'Hilda', 'Ingrid', 'Kelda', 'Lofn', 'Marta', 'Nanna', 'Olva', 'Ragna', 'Sigrid', 'Thyra', 'Ulfhild', 'Vigdis', 'Ylva'],
    },
    surnames: ['Barbaferro', 'Martelo', 'Escudoforte', 'Pedrafogo', 'Forjadura', 'Machado', 'Mãosdeouro', 'Barbaprata', 'Minério', 'Bigorna', 'Coração de Pedra', 'Punho de Ferro'],
  },
  {
    id: 'dahllan',
    name: 'Dahllan',
    icon: '🌿',
    names: {
      male: ['Aeron', 'Briar', 'Carvalho', 'Drystan', 'Eldar', 'Florian', 'Galan', 'Hawthorn', 'Ivar', 'Jaspin', 'Keiran', 'Linden', 'Moss', 'Neven', 'Olwen', 'Rowan', 'Sylvan', 'Thorn'],
      female: ['Alena', 'Bryonia', 'Cerys', 'Dahlia', 'Elowen', 'Fern', 'Gaia', 'Hazel', 'Ivy', 'Juniper', 'Kira', 'Laurel', 'Melia', 'Nara', 'Olívia', 'Primrose', 'Rosa', 'Sage'],
    },
  },
  {
    id: 'elfo',
    name: 'Elfo',
    icon: '🧝',
    names: {
      male: ['Arannis', 'Caelum', 'Daeris', 'Elarian', 'Faelion', 'Galadrius', 'Helion', 'Ithilion', 'Kaelith', 'Luthien', 'Mirael', 'Naerion', 'Orelian', 'Pyriel', 'Quelion', 'Raelis', 'Sindarin', 'Thalion'],
      female: ['Arwen', 'Celenia', 'Drielle', 'Eleniel', 'Faelwen', 'Galathea', 'Isilwen', 'Kaelynn', 'Lyralei', 'Miriel', 'Nieriel', 'Ondrea', 'Pyralis', 'Quelara', 'Rielwen', 'Sylriel', 'Theliel', 'Vanya'],
    },
    surnames: ['Folha Prateada', 'Luar Eterno', 'Vento Sutil', 'Estrela Cadente', 'Arco Dourado', 'Raio de Lua', 'Passo Silente', 'Aurora Eterna'],
  },
  {
    id: 'goblin',
    name: 'Goblin',
    icon: '👺',
    names: {
      male: ['Blix', 'Crink', 'Drex', 'Fizz', 'Grik', 'Hix', 'Jink', 'Krix', 'Lurk', 'Mox', 'Nix', 'Plink', 'Quix', 'Rix', 'Skiz', 'Trik', 'Vrex', 'Zik'],
      female: ['Bree', 'Clix', 'Dree', 'Fizzy', 'Glim', 'Hex', 'Jinx', 'Kree', 'Lix', 'Miri', 'Nyx', 'Pip', 'Quill', 'Rix', 'Skit', 'Trix', 'Vix', 'Zizi'],
    },
  },
  {
    id: 'lefou',
    name: 'Lefou',
    icon: '🦇',
    names: {
      male: ['Azroth', 'Bael', 'Carak', 'Demos', 'Erebus', 'Faust', 'Gorthan', 'Hex', 'Ixion', 'Kael', 'Lazarus', 'Mordin', 'Noctis', 'Obsidian', 'Ravak', 'Shade', 'Theron', 'Vex'],
      female: ['Ashara', 'Belith', 'Crimson', 'Desira', 'Eclipsa', 'Fenris', 'Grimoire', 'Hecate', 'Isolde', 'Kalista', 'Lilith', 'Morana', 'Nyx', 'Onyx', 'Raven', 'Sable', 'Umbra', 'Vesper'],
    },
  },
  {
    id: 'minotauro',
    name: 'Minotauro',
    icon: '🐂',
    names: {
      male: ['Asterion', 'Borak', 'Crassus', 'Dagon', 'Eratos', 'Gorthak', 'Hector', 'Ikaros', 'Kronos', 'Labrys', 'Minos', 'Nestor', 'Oxar', 'Primus', 'Rhogar', 'Stentor', 'Taurus', 'Ursok'],
      female: ['Ariadne', 'Bovina', 'Callista', 'Damara', 'Eumelia', 'Gordia', 'Hekuba', 'Kassandra', 'Leona', 'Medeia', 'Niobe', 'Pasiphae', 'Rhea', 'Selena', 'Theia', 'Xena'],
    },
    surnames: ['Chifre de Ferro', 'Casco Trovejante', 'Fúria', 'Marteloferoz', 'Sangue Bravo', 'Touro Negro'],
  },
  {
    id: 'qareen',
    name: 'Qareen',
    icon: '🧞',
    names: {
      male: ['Amir', 'Bahir', 'Cyrus', 'Darius', 'Emir', 'Farid', 'Ghazi', 'Hakim', 'Ibrahim', 'Jalil', 'Karim', 'Latif', 'Malik', 'Nasir', 'Omar', 'Rashid', 'Salim', 'Tariq'],
      female: ['Aaliyah', 'Basira', 'Dalila', 'Eshe', 'Farah', 'Ghalia', 'Halima', 'Inara', 'Jamila', 'Kalila', 'Layla', 'Mariam', 'Nadia', 'Qamar', 'Rania', 'Samira', 'Tahira', 'Zahra'],
    },
    surnames: ['al-Rashid', 'al-Malik', 'ibn Suleiman', 'al-Ghazi', 'al-Nur', 'ibn Farid'],
  },
  {
    id: 'golem',
    name: 'Golem',
    icon: '🗿',
    names: {
      unisex: ['Basalto', 'Cromo', 'Diamante', 'Ébano', 'Ferro', 'Granito', 'Jade', 'Ônix', 'Pedra', 'Quartzo', 'Rubi', 'Sílex', 'Titânio', 'Cobalto', 'Obsidiana', 'Ametista', 'Bronze', 'Cobre'],
    },
  },
  {
    id: 'hynne',
    name: 'Hynne',
    icon: '🍀',
    names: {
      male: ['Aldwin', 'Bardo', 'Corbin', 'Dudo', 'Eldon', 'Finn', 'Garrick', 'Hamfast', 'Ivo', 'Jasper', 'Kel', 'Ludo', 'Merric', 'Ned', 'Osborn', 'Pip', 'Robin', 'Sam'],
      female: ['Ada', 'Bree', 'Cora', 'Daisy', 'Elanor', 'Flora', 'Gilly', 'Holly', 'Ida', 'Joy', 'Kit', 'Lily', 'Mabel', 'Nell', 'Olive', 'Poppy', 'Rose', 'Wren'],
    },
    surnames: ['Pé Ligeiro', 'Bom Apetite', 'Mãos Hábeis', 'Sorriso Fácil', 'Bolso Fundo', 'Passo Manso'],
  },
  {
    id: 'kliren',
    name: 'Kliren',
    icon: '🔧',
    names: {
      male: ['Blix', 'Cogsworth', 'Dink', 'Engel', 'Fizzwick', 'Gizmo', 'Hank', 'Kelvin', 'Lenz', 'Mekanus', 'Newton', 'Otto', 'Pascal', 'Ratchet', 'Spark', 'Tesla', 'Volt', 'Watt'],
      female: ['Ada', 'Boltz', 'Cera', 'Dynamo', 'Electra', 'Flux', 'Gera', 'Helix', 'Iris', 'Joule', 'Kira', 'Luma', 'Mica', 'Nova', 'Optica', 'Prisma', 'Radia', 'Sola'],
    },
    surnames: ['Engrenagem', 'Parafuso', 'Mola Mestra', 'Circuito', 'Alavanca'],
  },
  {
    id: 'ostsjor',
    name: 'Ostsjor',
    icon: '🐻',
    names: {
      male: ['Bjorn', 'Dag', 'Erik', 'Fenrir', 'Gunnar', 'Harald', 'Ivar', 'Jarl', 'Knut', 'Leif', 'Magnus', 'Njord', 'Odin', 'Ragnar', 'Sigurd', 'Thor', 'Ulf', 'Viking'],
      female: ['Astrid', 'Brunhilde', 'Dagmar', 'Eira', 'Freydis', 'Gudrun', 'Helga', 'Ingeborg', 'Jorunn', 'Katla', 'Lagertha', 'Randi', 'Sigrun', 'Solveig', 'Thora', 'Yrsa'],
    },
    surnames: ['Barba Gelo', 'Punho do Norte', 'Sangue de Urso', 'Olho de Tempestade', 'Capa de Neve'],
  },
  {
    id: 'sereia',
    name: 'Sereia/Tritão',
    icon: '🧜',
    names: {
      male: ['Aegir', 'Coral', 'Delmar', 'Écume', 'Fluxo', 'Glaucus', 'Hydro', 'Ictus', 'Kaito', 'Lago', 'Maré', 'Nereus', 'Oceano', 'Pelago', 'Remo', 'Sireno', 'Tritão', 'Undino'],
      female: ['Aqua', 'Brisa', 'Coral', 'Delfina', 'Espuma', 'Fonte', 'Gota', 'Iara', 'Laguna', 'Marina', 'Naiade', 'Onda', 'Perla', 'Riacho', 'Serena', 'Tethys', 'Undina', 'Vaga'],
    },
  },
  {
    id: 'silfide',
    name: 'Sílfide',
    icon: '🦋',
    names: {
      male: ['Aério', 'Briso', 'Ciclone', 'Éfiro', 'Furacão', 'Galerno', 'Harmattan', 'Íris', 'Levante', 'Mistral', 'Noto', 'Pampero', 'Siroco', 'Terral', 'Vendaval', 'Zéfiro'],
      female: ['Aragem', 'Brisa', 'Celina', 'Eólia', 'Fada', 'Garoa', 'Lufada', 'Neblina', 'Névoa', 'Orvalho', 'Pluma', 'Rajada', 'Sereno', 'Tufão', 'Viração', 'Aurora'],
    },
  },
  {
    id: 'suraggel',
    name: 'Suraggel',
    icon: '😇',
    names: {
      male: ['Azrael', 'Cassiel', 'Ezriel', 'Gabriel', 'Ishmael', 'Kemuel', 'Lirael', 'Malakiel', 'Nathaniel', 'Ozriel', 'Raphael', 'Samael', 'Turiel', 'Uriel', 'Xaphiel', 'Zachariel'],
      female: ['Ariel', 'Celestia', 'Diniel', 'Erelah', 'Gavriel', 'Haniel', 'Ithuriel', 'Jediel', 'Kerubiel', 'Lumiel', 'Muriel', 'Nariel', 'Orifiel', 'Puriel', 'Sariel', 'Zuriel'],
    },
  },
  {
    id: 'trog',
    name: 'Trog',
    icon: '🦎',
    names: {
      unisex: ['Crak', 'Driss', 'Fang', 'Grit', 'Hiss', 'Irk', 'Jash', 'Kresh', 'Lurk', 'Mash', 'Nark', 'Prex', 'Rusk', 'Slink', 'Thrax', 'Vrak', 'Xiss', 'Zark'],
    },
  },
]

export function generateName(race: T20Race, gender?: 'male' | 'female', includeSurname?: boolean): string {
  const names = gender && race.names[gender]
    ? race.names[gender]!
    : race.names.unisex ?? race.names.male ?? race.names.female ?? []

  if (names.length === 0) return 'Nome'

  const name = names[Math.floor(Math.random() * names.length)]

  if (includeSurname && race.surnames && race.surnames.length > 0) {
    const surname = race.surnames[Math.floor(Math.random() * race.surnames.length)]
    return `${name} ${surname}`
  }

  return name
}
