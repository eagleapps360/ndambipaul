export type BiographyImageFit = "contain" | "cover";
export type BiographyFrameRatio = "portrait" | "landscape" | "square" | "auto";

export type BiographyMedia = {
  src: string;
  alt: string;
  caption?: string;
  fit?: BiographyImageFit;
  objectPosition?: string;
  width?: number;
  height?: number;
  frameRatio?: BiographyFrameRatio;
};

export type BiographySection = {
  id: string;
  chapter: string;
  title: string;
  shimmerWord?: string;
  paragraphs: string[];
  image?: BiographyMedia | null;
  imagePlacement?: "left" | "right";
};

export const biographyHero = {
  kicker: "THE LIFE STORY OF",
  title: "Pa Ndambi Paul Angemba",
  subtitle: "Teacher, father, mentor, Christian servant, Scout leader and custodian of family memory.",
  dates: "14 September 1951 - 7 June 2026",
  image: {
    src: "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg",
    alt: "Portrait of Pa Ndambi Paul Angemba in blue and white regalia",
    caption: "A gracious portrait from the family archive.",
    fit: "cover",
    objectPosition: "center 18%",
    width: 540,
    height: 1200,
    frameRatio: "portrait",
  },
} as const;

export const biographyOpening = {
  chapter: "00",
  title: "Opening Life Summary",
  shimmerWord: "Summary",
  paragraphs: [
    "Pa Ndambi Paul Angemba was born on 14 September 1951 in Oshie, Njikwa Subdivision, Momo Division, in the North-West Region of Cameroon. He was the first son of Pa Ndambi Moses Azongkoh, a fervent Christian and evangelist of the Basel Mission, whose devotion to God and passion for spreading the Gospel helped lay the spiritual foundation upon which his children would build. From his early years, Bro Ndambi Paul was shaped by faith, discipline, hard work and a deep consciousness of responsibility to God, family and society.",
  ],
} as const;

export const biographySections: BiographySection[] = [
  {
    id: "education-professional-service",
    chapter: "01",
    title: "Education and Professional Service",
    shimmerWord: "Professional",
    paragraphs: [
      "What would become a lifetime of teaching, leadership and public service was shaped by dedication to education. After obtaining his First School Leaving Certificate in Oshie, he pursued professional teacher training in Guka, Batibo, and earned several educational and professional qualifications over the years.",
      "He began his career as a classroom teacher in 1973 and served in several schools across the North West, including GS Jakiri, GS Kiyan in Kumbo, GS Bamkika, GS Tobin and GS Simon-Koh in Oku. Wherever he was posted, he brought with him a strong work ethic, careful organisation and a sincere desire to shape both the minds and character of his pupils.",
      "His diligence and leadership abilities later earned him appointments as Headmaster in several institutions, including GS Mbengwi, GS Chigwiri and GS Tuayang. He subsequently moved into educational administration, serving at the Inspectorate of Education in Mbengwi and later within the Divisional Delegations of National Education and Basic Education for Momo Division.",
      "His work included responsibilities in examinations, pedagogy and educational administration. By 2011, when he retired from the public service, he had accumulated thirty-nine years of professional service in teaching, educational leadership and administration.",
    ],
    image: {
      src: "/images/pa-ndambi/pa-ndambi-traditional-blue.jpg",
      alt: "Pa Ndambi Paul Angemba standing outdoors in blue attire",
      caption: "A life marked by dignity, service and steady leadership.",
      fit: "contain",
      objectPosition: "center",
      width: 810,
      height: 1080,
      frameRatio: "portrait",
    },
    imagePlacement: "left",
  },
  {
    id: "christian-youth-service-scouting",
    chapter: "02",
    title: "Christian Youth Service & Scouting",
    shimmerWord: "Scouting",
    paragraphs: [
      "He loved order, discipline, uniformity, preparedness and responsibility. He put in personal efforts to mobilise and train youngsters, pushing them to exercise their duties during 11 February, 20 May and other public events. In time, he rose to serve as the Divisional Commissioner of Scouts for Momo Division, further helping to shape and guide generations of young people.",
      "Yet his passion for youth formation did not end with the Scouts. He carried the same principles into the youth movements of the Presbyterian Church in Cameroon. Through his work with Young Presbyterians and CYF, he taught young people to be disciplined, dependable, morally upright and conscious of their responsibilities to God, family and society.",
      "He served in the Sunday School, then in YP as a leader, Adviser, Presbytery YPPR, Regional YPPR and National YPPR.",
      "He was so attached to the Youth Department that he remained there for most of his active Christian service. It was only at the age of 70 that he finally accepted the call to join the Christian Men Fellowship. Even then, he entered the CMF with the same passion, energy and sense of responsibility that had characterised his many years of service among young people.",
      "Today, his children cannot be counted only within his immediate household. They are found among former pupils, Scouts, YPs, mentees and community members whose lives he influenced.",
      "Pa Ndambi loved God sincerely, as seen in his personal writings, his love for the Church, his love and respect for his pastors, and his efforts to promote the work of God as much as he could. He gave his time, strength, wisdom and resources in support of Christian ministry.",
      "Whether through youth formation, church activities, advice, encouragement or practical contribution, he sought to ensure that the work of God moved forward.",
    ],
    image: {
      src: "/images/pa-ndambi/pa-ndambi-scout-memory.jpg",
      alt: "Pa Ndambi Paul Angemba in Scout uniform at a youth event",
      caption: "His service among young people shaped many lives.",
      fit: "contain",
      objectPosition: "center",
      width: 563,
      height: 1000,
      frameRatio: "portrait",
    },
    imagePlacement: "right",
  },
  {
    id: "father-beyond-immediate-family",
    chapter: "03",
    title: "A Father Beyond His Immediate Family",
    shimmerWord: "Father",
    paragraphs: [
      "At home, Pa Ndambi was a husband, father, grandfather and guardian whose influence stretched far beyond his immediate household.",
      "He and his beloved wife were blessed with six biological children. However, the family they raised was much larger. Their home welcomed adopted children, relatives and other young people who grew up under their roof and received the same guidance, discipline and care.",
      "He did not merely provide a place for these children to stay. He took an interest in their upbringing, education, conduct and future. To grow up in his home was to encounter structure, instruction, correction, humour and a strong expectation that one should become responsible in life.",
      "His home became a place where many were raised, guided and prepared for adulthood.",
    ],
    image: {
      src: "/images/pa-ndambi/family345.jpeg",
      alt: "Pa Ndambi with members of his family in a group portrait",
      caption: "Family remained at the heart of Pa Ndambi's life and legacy.",
      fit: "contain",
      objectPosition: "center",
      width: 1080,
      height: 592,
      frameRatio: "landscape",
    },
    imagePlacement: "left",
  },
  {
    id: "the-man-who-remembered-everything",
    chapter: "04",
    title: "The Man Who Remembered Everything",
    shimmerWord: "Remembered",
    paragraphs: [
      "Pa Ndambi was remarkably meticulous. He paid attention to details that most people would easily overlook. He was always writing, keeping notes and preserving information. Dates, names, contributions, journeys, appointments, ceremonies and family events were carefully recorded in his notebooks and documents, many of which remain today.",
      "Within the family, he was the \"Oracle Database.\" Whenever anyone needed an important piece of information, there was little reason to panic because Dad's records were likely to have it.",
      "He could tell his children the exact time they were born, the name of the midwife who assisted at their birth, the date of a graduation or academic defence, the people present at an important occasion, who brought what, and how major family events unfolded.",
      "Long before digital databases became part of daily life, Pa Ndambi had built a dependable archive of personal and family history.",
      "His surviving notes are more than papers filled with dates. They reflect a man who understood the importance of memory. He knew that details mattered, that history should be preserved and that future generations would one day need to know where they came from.",
      "Today, those records have become part of the inheritance he left behind, and a great responsibility to those who are alive to carry and spread the values he stood for.",
    ],
    image: {
      src: "/images/pa-ndambi/pa-ndambi-close-portrait.jpg",
      alt: "Close portrait of Pa Ndambi Paul Angemba",
      caption: "The keeper of family memory and faithful record.",
      fit: "contain",
      objectPosition: "center",
      width: 1536,
      height: 2040,
      frameRatio: "portrait",
    },
    imagePlacement: "right",
  },
  {
    id: "a-man-of-wit-and-wisdom",
    chapter: "05",
    title: "A Man of Wit and Wisdom",
    shimmerWord: "Wisdom",
    paragraphs: [
      "In his youth, he fondly nicknamed himself \"Charlton.\" In later years he addressed himself as \"Paworo, 'nwo Ndambi\" - Paul, son of Ndambi.",
      "For all his discipline and seriousness about duty, Pa Ndambi was also a man of humour. He loved jokes and filled family conversations with memorable expressions and strong \"conscience talk.\"",
      "His words often made people laugh, but they also made them think. He could use humour to teach a lesson, correct a wrong attitude or awaken someone's sense of responsibility.",
      "Many of his expressions remain alive in the memories of those who knew him, repeated with laughter because they still sound alive, just like Dad.",
      "Among the family's warmest memories was his extraordinary love for groundnuts. Boiled, roasted, fresh or dried, he enjoyed them in almost every form. His fondness for groundnuts was so well known that he was sometimes called \"the rat.\"",
      "He was a man of vision who shared his plans with those he trusted and encouraged people to be frugal and invest. He preserved small investments as much as he could, towards the realisation of his plans.",
    ],
    image: {
      src: "/images/pa-ndambi/pa-ndambi-beach.jpg",
      alt: "Pa Ndambi Paul Angemba smiling at the beach",
      caption: "A lighter moment that still carries his thoughtful presence.",
      fit: "contain",
      objectPosition: "center",
      width: 1509,
      height: 1356,
      frameRatio: "square",
    },
    imagePlacement: "left",
  },
  {
    id: "community-and-institutional-service",
    chapter: "06",
    title: "Community and Institutional Service",
    shimmerWord: "Community",
    paragraphs: [
      "His commitment to service also extended into community and institutional life.",
      "He participated in several educational, Christian, social and development organisations including CAMNAFAW, LACC, BATAAS, PMEC and Tobho Council, and served as a Board Member of the Mbengwi Credit Union.",
      "He served in numerous capacities - as member, adviser, commissioner, president, vice-president, secretary and community leader.",
      "He was not content merely to belong to organisations. Wherever he found himself, he became involved, accepted responsibility and contributed to the progress of the group.",
    ],
    image: {
      src: "/images/pa-ndambi/pa-ndambi-street.jpg",
      alt: "Profile image of Pa Ndambi Paul Angemba outdoors during travel",
      caption: "He carried purpose and presence into every community he served.",
      fit: "contain",
      objectPosition: "center",
      width: 1200,
      height: 1600,
      frameRatio: "portrait",
    },
    imagePlacement: "right",
  },
  {
    id: "last-years",
    chapter: "07",
    title: "Last Years",
    shimmerWord: "Years",
    paragraphs: [
      "In his later years, Pa Ndambi enjoyed the company of his children and grandchildren. He spent treasured periods with family at home and also travelled to be with his loved ones in Kenya and Canada.",
      "After a lifetime devoted to raising, teaching, guiding and serving others, these years gave him opportunities to sit among the generations that had come after him - to share stories, laughter, counsel and the quiet satisfaction of seeing the family grow.",
    ],
    image: {
      src: "/images/pa-ndambi/pa-ndambi-olympic-stadium.jpg",
      alt: "Pa Ndambi Paul Angemba during later-life travel in Montreal",
      caption: "His later years were rich with family, stories and travel.",
      fit: "contain",
      objectPosition: "center",
      width: 1600,
      height: 1200,
      frameRatio: "landscape",
    },
    imagePlacement: "left",
  },
  {
    id: "legacy-conclusion",
    chapter: "08",
    title: "Legacy Conclusion",
    shimmerWord: "Legacy",
    paragraphs: [
      "Pa Ndambi Paul Angemba leaves behind his beloved wife, six children, twenty grandchildren, the many children he helped to raise, and an immense family of pupils, Scouts, YPs, CYFs, mentees, colleagues, friends and community members.",
      "He leaves behind notebooks filled with history, institutions strengthened by his service, young lives shaped by his discipline and a family enriched by his faith, wisdom and humour.",
      "That swaggaliscious hunch-walk is now gone. The voice that supplied forgotten dates and unforgettable jokes may no longer answer as before, but the values he planted remain.",
      "His discipline lives in those he trained. His faith lives in those he encouraged to serve God. His records continue to speak. His humorous phrases continue to bring smiles. His teachings continue to guide.",
      "His children, grandchildren and disciples carry his name and legacy forward. He has completed his earthly assignment, but the work of his hands and the influence of his life remain.",
      "In the hearts of those who called him husband, Dad, Grandpa, teacher, brother, kim, commissioner, adviser, mentor or friend, Ndambi Paul Angemba will never truly be gone.",
    ],
    image: {
      src: "/images/pa-ndambi/pa-ndambi-airport-profile.jpg",
      alt: "Pa Ndambi Paul Angemba standing with family during later years",
      caption: "A legacy carried forward by the generations he loved.",
      fit: "contain",
      objectPosition: "center",
      width: 908,
      height: 1449,
      frameRatio: "portrait",
    },
    imagePlacement: "right",
  },
];
