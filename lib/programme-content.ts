export const programmeHero = {
  eyebrow: "Funeral Programme",
  title: "Celebrating the Life of Pa Ndambi Paul Angemba",
  copy: "The order of events, worship and remembrance for the Wake Service, Funeral Service and Burial of Pa Ndambi Paul Angemba.",
  dateRange: "2-4 July 2026",
};

export const programmeNavigator = [
  { id: "overview", label: "Overview" },
  { id: "wake-service", label: "Wake Service" },
  { id: "funeral-day", label: "Funeral Day" },
  { id: "church-service", label: "Church Service" },
  { id: "downloads", label: "Downloads" },
] as const;

export const programmeOverviewEvents = [
  {
    id: "wake-service",
    eyebrow: "Thursday, 2 July 2026",
    title: "Wake Service",
    time: "4:00 PM",
    venue: "Family Residence, Mbengwi",
    note: "Wake service without corpse",
  },
  {
    id: "funeral-day",
    eyebrow: "Friday, 3 July 2026",
    title: "Funeral and Burial",
    time: "7:30 AM onwards",
    venue: "Mbengwi Mortuary, Tobho Back Mbon, PC Njembeng and family residence",
    note: "Removal, laying in state, church service, burial and reception",
  },
  {
    id: "departure",
    eyebrow: "4 July 2026",
    title: "Family Meeting and Departure",
    time: "Following burial weekend",
    venue: "Family arrangements",
    note: "Displayed without weekday because the source document contains a weekday conflict.",
  },
] as const;

export const wakeServiceOrder = [
  "Opening Prayer",
  "Praise & Worship",
  "Hymn 1",
  "First Reading",
  "CMF Song",
  "Second Reading",
  "Hymn 2",
  "The Word - Pastor Asanji Fru Ndi",
  "Prayer for the Family",
  "Hymn 3",
  "Benediction",
] as const;

export const wakeOfficiatingMinisters = [
  "Rev Colombus Yande",
  "Pst Franklin Tagyen",
  "Pst Asanji Fru Ndi",
] as const;

export const wakeParticipatingGroups = ["CMF", "CWF", "CYF"] as const;

export const wakeHymnReferences = [
  {
    title: "I Hear Thy Welcome Voice",
    reference: "CHB 489 / CH 689",
    note: "Opening wake hymn reference",
  },
  {
    title: "Through the Love of God our Saviour",
    reference: "CHB 517 / CH 702",
    note: "Middle wake hymn reference",
  },
  {
    title: "How Great Thou Art",
    reference: "CHB 78",
    note: "Closing wake hymn reference",
  },
] as const;

export const burialSchedule = [
  {
    time: "7:30 AM",
    title: "Removal of mortal remains",
    detail: "Mbengwi Mortuary",
  },
  {
    time: "8:00 AM - 9:30 AM",
    title: "Lying in State",
    detail: "Family residence at Tobho, Back Mbon",
  },
  {
    time: "10:00 AM",
    title: "Church service",
    detail: "Presbyterian Church Njembeng",
  },
  {
    time: "12:15 PM",
    title: "Burial",
    detail: "Family residence at Tobho, Back Mbon, Mbengwi",
  },
  {
    time: "2:00 PM",
    title: "Reception and Celebration",
    detail: "Venue not specified in the provided programme document",
  },
] as const;

export const burialSalutation = [
  {
    leader: "Minister",
    response: "The grace of our Lord Jesus Christ, the love of God and the communion of the Holy Spirit be with you all.",
  },
  {
    leader: "Congregation",
    response: "And also with you.",
  },
  {
    leader: "Minister",
    response: "There is a friend who sticks closer than a brother.",
  },
  {
    leader: "Congregation",
    response: "His name is Jesus.",
  },
] as const;

export const openingSentence = {
  reference: "John 14:1-3",
  text:
    "Do not let your hearts be troubled. Believe in God, believe also in me. In my Father's house there are many dwelling places. I go to prepare a place for you.",
};

export const responsivePsalm = {
  reference: "Psalm 90:1-12",
  lines: [
    { leader: "Minister", response: "Lord, you have been our dwelling place in all generations." },
    { leader: "Congregation", response: "Before the mountains were brought forth, or ever you had formed the earth and the world, from everlasting to everlasting you are God." },
    { leader: "Minister", response: "You turn us back to dust, and say, Return, O children of Adam." },
    { leader: "Congregation", response: "For a thousand years in your sight are like yesterday when it is past, or like a watch in the night." },
    { leader: "Minister", response: "You sweep them away, they are like a dream, like grass that is renewed in the morning." },
    { leader: "Congregation", response: "In the morning it flourishes and is renewed; in the evening it fades and withers." },
    { leader: "Minister", response: "Teach us to number our days that we may gain a wise heart." },
    { leader: "Congregation", response: "Lord, I am continually with you; you hold my right hand. You guide me with your counsel, and afterward you will receive me with honour." },
  ],
};

export const openingHymn = {
  title: "Blessed Assurance",
  reference: "CHB 482 / CH 697",
};

export const churchServiceOrderGroups = [
  {
    title: "Opening Liturgy",
    items: [
      "The Salutation",
      "The Opening Sentence",
      "Opening Hymn - Blessed Assurance",
      "Responsive Psalm",
      "CMF Song",
    ],
  },
  {
    title: "Eulogies",
    items: ["Biography", "Family Head", "Wife", "YPs", "CMF", "Congregation"],
  },
  {
    title: "Message and Ministry",
    items: [
      "Hymn - Only Remembered by What We Have Done",
      "Sermon",
      "Song - Congregational Choir",
      "Funeral Offering - CWF / Hallelujah Choir",
      "Family Thanksgiving",
      "Holy Communion",
    ],
  },
  {
    title: "Commendation and Close",
    items: ["Announcements", "Commendation", "Recession"],
  },
] as const;

export const eulogies = ["Biography", "Family Head", "Wife", "YPs", "CMF", "Congregation"] as const;

export const memorialHymn = {
  title: "Only Remembered by What We Have Done",
  reference: "CHB 238",
};

export const remainingServiceItems = [
  "Sermon",
  "Song - Congregational Choir",
  "Funeral Offering - CWF / Hallelujah Choir",
  "Family Thanksgiving",
  "Holy Communion",
  "Announcements",
  "Commendation",
  "Recession",
] as const;

export const funeralOfficiatingMinisters = [
  "Rev. Nchotu Moses Shu",
  "Rev. Colombus Yande",
  "Rev. Lawrence Fominyen",
  "Rev. Njomaso N. Genesis",
  "Rev. Tayong Marcel T.",
  "Rev. Kengwa Godfrey",
  "Pst Arreneke E. Ayuk",
  "Pst Tah Festus",
] as const;

export const participatingGroups = ["CMF", "CWF", "CYF", "YPs", "Congregational Choir", "Hallelujah Choir"] as const;

export const departureInformation = {
  title: "Family Meeting and Departure",
  date: "4 July 2026",
  note: "The programme document lists a conflicting weekday, so the public page shows the confirmed date without a weekday label.",
};

export const programmeDownloads = [
  {
    title: "Wake Service Programme",
    href: "/documents/wake-service-programme.docx",
    format: "DOCX",
  },
  {
    title: "Funeral and Burial Programme",
    href: "/documents/funeral-and-burial-programme.docx",
    format: "DOCX",
  },
] as const;

export function getProgrammeAnchorBySlug(slug: string) {
  const key = slug.trim().toLowerCase();

  if (["wake-service", "wake-service-camp-fire", "camp-fire", "wake"].includes(key)) {
    return "wake-service";
  }

  if (["church-service"].includes(key)) {
    return "church-service";
  }

  if (["burial-service", "funeral", "burial"].includes(key)) {
    return "funeral-day";
  }

  return "overview";
}
