export interface ReviewedSourceNameGroup {readonly name:string;readonly course?:string;readonly allowNoHistory?:boolean;readonly ownerId?:string;readonly initialProfileId?:string;readonly createIfMissing?:boolean;readonly stubs?:readonly {id:string;name:string;sourceProfessorId?:string}[];readonly members:readonly {id:string;name:string;department:string}[];readonly evidence?:readonly string[];readonly reviewGroup?:number}

// Reviewed external evidence, scoped to these names, source IDs and course owners.
export const REVIEWED_SOURCE_NAME_GROUPS:readonly ReviewedSourceNameGroup[]=[
  {
    "name": "Jones, Miles E",
    "course": "CSE/101",
    "initialProfileId": "1513786",
    "members": [
      {
        "id": "2110462",
        "name": "Miles Jones",
        "department": "Computer Science"
      },
      {
        "id": "1513786",
        "name": "Miles Jones",
        "department": "Mathematics"
      }
    ],
    "evidence": [
      "https://cseweb.ucsd.edu/~mej016/"
    ],
    "reviewGroup": 1
  },
  {
    "name": "Frank, Ross H.",
    "course": "ETHN/1",
    "initialProfileId": "510899",
    "members": [
      {
        "id": "2340829",
        "name": "Ross Frank",
        "department": "Ethnic Studies"
      },
      {
        "id": "510899",
        "name": "Ross Frank",
        "department": "Social Science"
      }
    ],
    "evidence": [
      "https://criticalmissionstudies.ucsd.edu/contacts/",
      "https://ethnicstudies.ucsd.edu/people/faculty-resources/general/committees.html"
    ],
    "reviewGroup": 2
  },
  {
    "name": "Lindenberger, Wade Douglas",
    "course": "MGT/12",
    "initialProfileId": "2259769",
    "members": [
      {
        "id": "2713416",
        "name": "Wade Lindenberger",
        "department": "Management"
      },
      {
        "id": "2259769",
        "name": "Wade Lindenberger",
        "department": "Business"
      }
    ],
    "evidence": [
      "https://rady.ucsd.edu/faculty-research/other-faculty/continuing-lecturers/wade-lindenberger.html"
    ],
    "reviewGroup": 3
  },
  {
    "name": "Duarte, Javier Mauricio",
    "course": "PHYS/105A",
    "initialProfileId": "2576513",
    "members": [
      {
        "id": "2657292",
        "name": "Javier Mauricio Duarte",
        "department": "Physics"
      },
      {
        "id": "2576513",
        "name": "Javier Duarte",
        "department": "Physics"
      }
    ],
    "evidence": [
      "https://jduarte.physics.ucsd.edu/"
    ],
    "reviewGroup": 4
  },
  {
    "name": "Tobey Tam",
    "initialProfileId": "2681911",
    "ownerId": "direct-rmp-2681911",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "2681911",
        "name": "Tobey Tam",
        "department": "Chemistry"
      },
      {
        "id": "2808905",
        "name": "Tobey Tam",
        "department": "Biology"
      }
    ],
    "evidence": [
      "https://extendedstudies.ucsd.edu/about-us/instructors/tam-tobey",
      "https://profiles.ucsd.edu/tobey.tam"
    ],
    "reviewGroup": 5
  },
  {
    "name": "Lo, Stanley Malvin Ming-Hi",
    "course": "BICD/100",
    "initialProfileId": "2046033",
    "members": [
      {
        "id": "2414990",
        "name": "Stanley Lo",
        "department": "Biology"
      },
      {
        "id": "2046033",
        "name": "Stanley Lo",
        "department": "Biological Sciences"
      }
    ],
    "evidence": [
      "https://biology.ucsd.edu/research/faculty/smlo"
    ],
    "reviewGroup": 6
  },
  {
    "name": "Strom, Megan C.",
    "course": "DOC/1",
    "initialProfileId": "1826241",
    "members": [
      {
        "id": "2188995",
        "name": "Megan Strom",
        "department": "Writing"
      },
      {
        "id": "1826241",
        "name": "Megan Strom",
        "department": "History"
      }
    ],
    "evidence": [
      "https://hh-marshall.ucsd.edu/about-us/staff.html",
      "https://hh-marshall.ucsd.edu/doc/people/index.html"
    ],
    "reviewGroup": 7
  },
  {
    "name": "Marino, Marc J",
    "course": "BIPN/100",
    "initialProfileId": "2807015",
    "members": [
      {
        "id": "2890005",
        "name": "Marc Marino",
        "department": "Biology"
      },
      {
        "id": "2807015",
        "name": "Marc Marino",
        "department": "Biological Sciences"
      }
    ],
    "evidence": [
      "https://profiles.ucsd.edu/marc.marino"
    ],
    "reviewGroup": 8
  },
  {
    "name": "Oconnor, Joseph M.",
    "course": "CHEM/140A",
    "initialProfileId": "1897314",
    "members": [
      {
        "id": "209071",
        "name": "Joseph O'Connor",
        "department": "Chemistry"
      },
      {
        "id": "1897314",
        "name": "Joseph Oconnor",
        "department": "Chemistry"
      }
    ],
    "evidence": [
      "https://oconnorgroup.ucsd.edu/Joe/CV.pdf"
    ],
    "reviewGroup": 9
  },
  {
    "name": "Peter Sifferlen",
    "initialProfileId": "1430484",
    "ownerId": "direct-rmp-1430484",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "1430484",
        "name": "Peter Sifferlen",
        "department": "Mathematics"
      },
      {
        "id": "3080951",
        "name": "PETER SIFFERLEN",
        "department": "Mathematics"
      }
    ],
    "evidence": [
      "https://extendedstudies.ucsd.edu/about-us/instructors/sifferlen-peter",
      "https://extendedstudies.ucsd.edu/about-us/instructors"
    ],
    "reviewGroup": 10
  },
  {
    "name": "Cartwright, Lisa",
    "course": "VIS/11",
    "initialProfileId": "252369",
    "members": [
      {
        "id": "2843409",
        "name": "Lisa Cartwright",
        "department": "Visual Arts"
      },
      {
        "id": "252369",
        "name": "Lisa Cartwright",
        "department": "Communication"
      }
    ],
    "evidence": [
      "https://www.visarts.ucsd.edu/people/emeriti-faculty/lisa-cartwright.html"
    ],
    "reviewGroup": 11
  },
  {
    "name": "Rana, Brinda Kanti",
    "course": "BILD/20",
    "initialProfileId": "2642915",
    "members": [
      {
        "id": "3147368",
        "name": "Brinda Rana",
        "department": "Public Health"
      },
      {
        "id": "2642915",
        "name": "Brinda Rana",
        "department": "Biology"
      }
    ],
    "evidence": [
      "https://hwsph.ucsd.edu/people/faculty/faculty-directory.html",
      "https://moorescancercenter.ucsd.edu/research/shared-resources/biobehavioral/index.html"
    ],
    "reviewGroup": 12
  },
  {
    "name": "Alvarez, Ana Maria",
    "course": "TDAC/123",
    "initialProfileId": "3086781",
    "members": [
      {
        "id": "3046747",
        "name": "Ana Maria Alvarez",
        "department": "Visual Arts"
      },
      {
        "id": "3086781",
        "name": "Ana Maria Alvarez",
        "department": "Theater"
      }
    ],
    "evidence": [
      "https://www-theatre.ucsd.edu/people/faculty/dance/ana-mar%C3%ADa-alvarez.html"
    ],
    "reviewGroup": 14
  },
  {
    "name": "Garcia, Guadalupe",
    "course": "USP/1",
    "initialProfileId": "3041290",
    "members": [
      {
        "id": "3041276",
        "name": "Guadalupe Garcia",
        "department": "Urban Studies"
      },
      {
        "id": "3041290",
        "name": "Guadalupe Garcia",
        "department": "Urban Planning"
      }
    ],
    "evidence": [
      "https://usp.ucsd.edu/about/faculty/index.html",
      "https://socialsciences.ucsd.edu/news/new-faculty-2024-25.html"
    ],
    "reviewGroup": 15
  },
  {
    "name": "Lisa Zeigler",
    "initialProfileId": "2849580",
    "ownerId": "direct-rmp-2849580",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "2849580",
        "name": "Lisa Zeigler",
        "department": "Biology"
      },
      {
        "id": "2849579",
        "name": "Lisa Zeigler",
        "department": "Biology"
      }
    ],
    "evidence": [
      "https://genomicsatsea.ucsd.edu/people/",
      "https://genomicsatsea.ucsd.edu/people-2/"
    ],
    "reviewGroup": 16
  },
  {
    "name": "Rahimi, Babak",
    "course": "CAT/3",
    "initialProfileId": "760132",
    "members": [
      {
        "id": "2022658",
        "name": "Babak Rahimi",
        "department": "Literature"
      },
      {
        "id": "760132",
        "name": "Babak Rahimi",
        "department": "Religion"
      }
    ],
    "evidence": [
      "https://hh-literature.ucsd.edu/people/faculty/brahimi.html",
      "https://religion.ucsd.edu/faculty/index.html"
    ],
    "reviewGroup": 17
  },
  {
    "name": "Blanco, John D",
    "course": "MMW/14",
    "initialProfileId": "287742",
    "members": [
      {
        "id": "3068437",
        "name": "Jody Blanco",
        "department": "Literature"
      },
      {
        "id": "2099775",
        "name": "Jody Blanco",
        "department": "History"
      },
      {
        "id": "287742",
        "name": "John Blanco",
        "department": "Literature"
      }
    ],
    "evidence": [
      "https://literature.ucsd.edu/people/faculty/jblanco.html",
      "https://www.ethnicstudies.ucsd.edu/people/faculty.html"
    ],
    "reviewGroup": 18
  },
  {
    "name": "Sujal Phadke",
    "initialProfileId": "2769569",
    "ownerId": "direct-rmp-2769569",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "2769569",
        "name": "Sujal Phadke",
        "department": "Biological Sciences"
      },
      {
        "id": "2769490",
        "name": "Sujal Phadke",
        "department": "Biology"
      }
    ],
    "evidence": [
      "https://extendedstudies.ucsd.edu/about-us/instructors/phadke-sujal",
      "https://profiles.ucsd.edu/sujal.phadke"
    ],
    "reviewGroup": 19
  },
  {
    "name": "Kovaka, Karen",
    "course": "PHIL/12",
    "initialProfileId": "2855730",
    "members": [
      {
        "id": "2915175",
        "name": "Karenc Kovaka",
        "department": "Philosophy"
      },
      {
        "id": "2855730",
        "name": "Karen Kovaka",
        "department": "Philosophy"
      }
    ],
    "evidence": [
      "https://philosophy.ucsd.edu/people/faculty.html",
      "https://blink.ucsd.edu/research/meet-ori/research-growth/faculty-ambassadors.html"
    ],
    "reviewGroup": 20
  },
  {
    "name": "Nguyen, Hoang Tan",
    "course": "CAT/2",
    "initialProfileId": "2567286",
    "members": [
      {
        "id": "3066290",
        "name": "Hoang Nguyen",
        "department": "Film"
      },
      {
        "id": "2567286",
        "name": "Hoang Nguyen",
        "department": "Art"
      }
    ],
    "evidence": [
      "https://lgbt.ucsd.edu/community/outlist.html",
      "https://www.ethnicstudies.ucsd.edu/people/faculty.html"
    ],
    "reviewGroup": 21
  },
  {
    "name": "Demetriou, Denise",
    "course": "HIEU/101",
    "initialProfileId": "2350404",
    "members": [
      {
        "id": "2426093",
        "name": "Denise Demetriou",
        "department": "Humanities"
      },
      {
        "id": "2350404",
        "name": "Denise Demetriou",
        "department": "History"
      }
    ],
    "evidence": [
      "https://history.ucsd.edu/people/faculty/demetriou.html",
      "https://helleniccenter.ucsd.edu/people/faculty/index.html"
    ],
    "reviewGroup": 22
  },
  {
    "name": "Danks, David J",
    "course": "PHIL/174",
    "initialProfileId": "3107635",
    "members": [
      {
        "id": "3057230",
        "name": "David Danks",
        "department": "Philosophy"
      },
      {
        "id": "3107635",
        "name": "David Danks",
        "department": "Data Science"
      }
    ],
    "evidence": [
      "https://mds.ucsd.edu/program/faculty-staff/faculty/danks.html",
      "https://today.ucsd.edu/story/ai-creeps-closer-to-human-agency"
    ],
    "reviewGroup": 23
  },
  {
    "name": "Murray, Kourtney Kristine",
    "course": "LTGK/1",
    "initialProfileId": "2701591",
    "members": [
      {
        "id": "2426917",
        "name": "Kourtney Murray",
        "department": "Classics"
      },
      {
        "id": "2701591",
        "name": "Kourtney Murray",
        "department": "Literature"
      }
    ],
    "evidence": [
      "https://helleniccenter.ucsd.edu/people/faculty/index.html",
      "https://roosevelt.ucsd.edu/about/faculty.html"
    ],
    "reviewGroup": 24
  },
  {
    "name": "Hildebrand, John A",
    "course": "ECE/145AL",
    "initialProfileId": "3048766",
    "members": [
      {
        "id": "3055942",
        "name": "John Hildebrand",
        "department": "Oceanography"
      },
      {
        "id": "3048766",
        "name": "John Hildebrand",
        "department": "Environment"
      }
    ],
    "evidence": [
      "https://scma.ucsd.edu/people/",
      "https://jahildebrand.scrippsprofiles.ucsd.edu/biography/"
    ],
    "reviewGroup": 25
  },
  {
    "name": "Meyer, Michael Wayne",
    "course": "DSGN/1",
    "initialProfileId": "2399813",
    "members": [
      {
        "id": "2643603",
        "name": "Michael Meyer",
        "department": "Design"
      },
      {
        "id": "2399813",
        "name": "Michael Meyer",
        "department": "Cognitive Science"
      }
    ],
    "evidence": [
      "https://ige.ucsd.edu/people/team-members",
      "https://senate.ucsd.edu/media/731799/dsgn-proposal-to-establish-master-of-design.pdf"
    ],
    "reviewGroup": 26
  },
  {
    "name": "Lerner, Amy M",
    "course": "ESYS/103",
    "initialProfileId": "2772682",
    "members": [
      {
        "id": "2967014",
        "name": "Amy Lerner",
        "department": "Urban Planning"
      },
      {
        "id": "2772682",
        "name": "Amy Lerner",
        "department": "Urban Studies"
      }
    ],
    "evidence": [
      "https://usp.ucsd.edu/about/faculty/index.html",
      "https://csp.ucsd.edu/our-team/supporting-faculty/"
    ],
    "reviewGroup": 27
  },
  {
    "name": "Streeby, Shelley",
    "course": "CAT/3",
    "initialProfileId": "609411",
    "members": [
      {
        "id": "2350735",
        "name": "Shelley Streeby",
        "department": "Ethnic Studies"
      },
      {
        "id": "609411",
        "name": "Shelley Streeby",
        "department": "Literature"
      }
    ],
    "evidence": [
      "https://literature.ucsd.edu/people/faculty/sstreeby.html",
      "https://www.ethnicstudies.ucsd.edu/people/streeby.html"
    ],
    "reviewGroup": 28
  },
  {
    "name": "Wilkinson, Marco",
    "course": "LTWR/100",
    "initialProfileId": "2972124",
    "members": [
      {
        "id": "2972127",
        "name": "Marco Wilkinson",
        "department": "Literature"
      },
      {
        "id": "2972124",
        "name": "Marco Wilkinson",
        "department": "English"
      }
    ],
    "evidence": [
      "https://hh-literature.ucsd.edu/people/faculty/mwilkinson.html",
      "https://environmentalstudies.ucsd.edu/people/affiliated-faculty"
    ],
    "reviewGroup": 30
  },
  {
    "name": "Daugherty, Matthew Dorton",
    "course": "BIMM/114",
    "initialProfileId": "2470567",
    "members": [
      {
        "id": "2671573",
        "name": "Matthew Daugherty",
        "department": "Biology"
      },
      {
        "id": "2470567",
        "name": "Matthew Daugherty",
        "department": "Biological Sciences"
      }
    ],
    "evidence": [
      "https://profiles.ucsd.edu/matthew.daugherty",
      "https://biology.ucsd.edu/research/faculty/mddaugherty"
    ],
    "reviewGroup": 31
  },
  {
    "name": "Chin, Bryan W.",
    "course": "CSE/120",
    "initialProfileId": "2345822",
    "members": [
      {
        "id": "2612027",
        "name": "Bryan Chin",
        "department": "Cognitive Science & Computer Engineering"
      },
      {
        "id": "2345822",
        "name": "Bryan Chin",
        "department": "Computer Science"
      }
    ],
    "evidence": [
      "https://cse.ucsd.edu/graduate/historical-data-course-descriptions-and-recommended-preparation",
      "https://cseweb.ucsd.edu/classes/fa22/cse30-a/Syllabus_CSE30_FA22.pdf"
    ],
    "reviewGroup": 32
  },
  {
    "name": "Beyhan, Sinem",
    "course": "BIBC/103",
    "initialProfileId": "2876937",
    "members": [
      {
        "id": "2767777",
        "name": "Sinem Beyhan",
        "department": "Biological Sciences"
      },
      {
        "id": "2876937",
        "name": "Sinem Beyhan",
        "department": "Biology"
      }
    ],
    "evidence": [
      "https://prepare.ucsd.edu/our-team/faculty/index.html",
      "https://calendar.ucsd.edu/event/rcr-workshop-mentoring-with-integrity-building-healthy-and-responsible-research-cultures"
    ],
    "reviewGroup": 33
  },
  {
    "name": "Hannah, Seth Donal",
    "course": "ANSC/148",
    "initialProfileId": "2580001",
    "members": [
      {
        "id": "2607625",
        "name": "Seth Hannah",
        "department": "Sociology"
      },
      {
        "id": "2580001",
        "name": "Seth Hannah",
        "department": "Health Science"
      }
    ],
    "evidence": [
      "https://anthropology.ucsd.edu/research/psych-anthro-labs/seminar.html",
      "https://globalhealthprogram.ucsd.edu/about/faculty.html"
    ],
    "reviewGroup": 34
  },
  {
    "name": "Leuning, Grant Maurstad",
    "course": "COMM/101A",
    "initialProfileId": "2704478",
    "members": [
      {
        "id": "2624714",
        "name": "Grant Leuning",
        "department": "Writing"
      },
      {
        "id": "2704478",
        "name": "Grant Leuning",
        "department": "Communication"
      }
    ],
    "evidence": [
      "https://communication.ucsd.edu/people/grad-alumni/index.html",
      "https://edgelandtech.ucsd.edu/committee/"
    ],
    "reviewGroup": 35
  },
  {
    "name": "Lerer, Seth",
    "course": "CLAS/120",
    "initialProfileId": "1700539",
    "members": [
      {
        "id": "857589",
        "name": "Seth Lerer",
        "department": "English"
      },
      {
        "id": "1700539",
        "name": "Seth Lerer",
        "department": "Humanities"
      }
    ],
    "evidence": [
      "https://helleniccenter.ucsd.edu/people/faculty/slerer.html",
      "https://literature.ucsd.edu/people/faculty/emeriti-slerer.html"
    ],
    "reviewGroup": 36
  },
  {
    "name": "Fuller, Robert L.",
    "course": "MGT/112",
    "initialProfileId": "2043155",
    "members": [
      {
        "id": "2109025",
        "name": "Robert Fuller",
        "department": "Business"
      },
      {
        "id": "2043155",
        "name": "Robert Fuller",
        "department": "Finance"
      }
    ],
    "evidence": [
      "https://senate.ucsd.edu/media/299421/proposal-ma-in-global-health.pdf",
      "https://senate.ucsd.edu/media/426849/med-proposed-ms-in-health-informatics-approved-by-gc.pdf"
    ],
    "reviewGroup": 37
  },
  {
    "name": "Paar, Hans Peter",
    "course": "PHYS/4A",
    "initialProfileId": "53164",
    "members": [
      {
        "id": "2144246",
        "name": "Hans Paar",
        "department": "Physics"
      },
      {
        "id": "53164",
        "name": "Hans Paar",
        "department": "Science"
      }
    ],
    "evidence": [
      "https://cosmology.ucsd.edu/people.php",
      "https://adminrecords.ucsd.edu/Notices/2018/2018-7-5-1.html"
    ],
    "reviewGroup": 40
  },
  {
    "name": "Weare, John H.",
    "course": "CHEM/131",
    "initialProfileId": "96466",
    "members": [
      {
        "id": "2118125",
        "name": "John Weare",
        "department": "Chemistry"
      },
      {
        "id": "96466",
        "name": "John Weare",
        "department": "Science"
      }
    ],
    "evidence": [
      "https://chemistry-biochemistry.ucsd.edu/faculty/profiles",
      "https://chemistry.ucsd.edu/faculty/index.shtml"
    ],
    "reviewGroup": 41
  },
  {
    "name": "Roger Levy",
    "initialProfileId": "908726",
    "ownerId": "direct-rmp-908726",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "908726",
        "name": "Roger Levy",
        "department": "Languages"
      },
      {
        "id": "2034021",
        "name": "Roger Levy",
        "department": "Linguistics"
      }
    ],
    "evidence": [
      "https://cpl.ucsd.edu/people/",
      "https://crl.ucsd.edu/people/"
    ],
    "reviewGroup": 42
  },
  {
    "name": "Kumar, Meera",
    "course": "SDCC/1",
    "initialProfileId": "818274",
    "members": [
      {
        "id": "1613294",
        "name": "Meera Kumar",
        "department": "Writing"
      },
      {
        "id": "818274",
        "name": "Meera Kumar",
        "department": "English"
      }
    ],
    "evidence": [
      "https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?sections=781261&selectedTerm=FA13&tabNum=tabs-sec"
    ],
    "reviewGroup": 43
  },
  {
    "name": "Delgado, Tania",
    "course": "COGS/153",
    "initialProfileId": "3108995",
    "members": [
      {
        "id": "3084466",
        "name": "Tania Delgado",
        "department": "Human Development"
      },
      {
        "id": "3108995",
        "name": "Tania Delgado",
        "department": "Cognitive Science & Computer Engineering"
      }
    ],
    "evidence": [
      "https://pages.ucsd.edu/~mboyle/COGS17/index.html",
      "https://ugresearch.ucsd.edu/_images/src/SRC-2022-Program-8.22.pdf"
    ],
    "reviewGroup": 44
  },
  {
    "name": "Jinich, Adrian",
    "course": "CHEM/169",
    "initialProfileId": "3084988",
    "members": [
      {
        "id": "3082399",
        "name": "Adrian Jinich",
        "department": "Chemistry"
      },
      {
        "id": "3084988",
        "name": "Adrian Jinich",
        "department": "Chemistry"
      }
    ],
    "evidence": [
      "https://bmb.ucsd.edu/research/profiles/14",
      "https://ucsd.edu/research-innovation/our-experts/ai-experts/"
    ],
    "reviewGroup": 45
  },
  {
    "name": "Prather, Lauren R",
    "course": "INTL/102",
    "initialProfileId": "3141196",
    "ownerId": "easy-a-prather-lauren-r-f46d8a6fbd",
    "stubs": [
      {
        "id": "easy-a-lauren-prather-7e5ee17cb3",
        "name": "Lauren Prather"
      }
    ],
    "members": [
      {
        "id": "3144440",
        "name": "Lauren Prather",
        "department": "Political Science"
      },
      {
        "id": "3141196",
        "name": "Lauren Prather",
        "department": "Political Science"
      }
    ],
    "evidence": [
      "https://gps.ucsd.edu/faculty-directory/lauren-prather.html",
      "https://igcc.ucsd.edu/people/lauren-prather/"
    ],
    "reviewGroup": 46
  },
  {
    "name": "Dai, Yinlin",
    "course": "ECON/1",
    "initialProfileId": "2942145",
    "members": [
      {
        "id": "3045009",
        "name": "Yinlin Dai",
        "department": "Political Science"
      },
      {
        "id": "2942145",
        "name": "Yinlin Dai",
        "department": "Economics"
      }
    ],
    "evidence": [
      "https://economics.ucsd.edu/faculty-and-research/faculty-profiles/index.html",
      "https://economics.ucsd.edu/faculty-and-research/faculty-profiles/dai.html"
    ],
    "reviewGroup": 47
  },
  {
    "name": "Emory, Kristen",
    "course": "FMPH/194",
    "initialProfileId": "2780067",
    "members": [
      {
        "id": "2889655",
        "name": "Kristen Emory",
        "department": "Medicine"
      },
      {
        "id": "2780067",
        "name": "Kristen Emory",
        "department": "Health Science"
      }
    ],
    "evidence": [
      "https://pulmonary.ucsd.edu/research/labs-centers/star-program/leadership-team/index.html",
      "https://pulmonary.ucsd.edu/research/labs-centers/star-program/curriculum/index.html"
    ],
    "reviewGroup": 48
  },
  {
    "name": "Prestholdt, Jeremy",
    "course": "HIAF/111",
    "initialProfileId": "638659",
    "members": [
      {
        "id": "2807198",
        "name": "Jeremy Prestholdt",
        "department": "Literature"
      },
      {
        "id": "638659",
        "name": "Jeremy Prestholdt",
        "department": "History"
      }
    ],
    "evidence": [
      "https://history.ucsd.edu/people/faculty/prestholdt.html",
      "https://profiles.ucsd.edu/jeremy.prestholdt"
    ],
    "reviewGroup": 49
  },
  {
    "name": "Falcon, Jennifer A",
    "course": "AWP/1",
    "initialProfileId": "2622992",
    "members": [
      {
        "id": "2933759",
        "name": "Jennifer Falcon",
        "department": "English"
      },
      {
        "id": "2622992",
        "name": "Jennifer Falcon",
        "department": "Writing"
      }
    ],
    "evidence": [
      "https://awp.ucsd.edu/about/people.html",
      "https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?sections=69487&selectedTerm=SP26&tabNum=tabs-sec"
    ],
    "reviewGroup": 50
  },
  {
    "name": "Olivia Griffin",
    "initialProfileId": "2991036",
    "ownerId": "direct-rmp-2991036",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "2991036",
        "name": "Olivia Griffin",
        "department": "Languages"
      },
      {
        "id": "2997763",
        "name": "Olivia Griffin",
        "department": "Linguistics"
      }
    ],
    "evidence": [
      "https://pages.ucsd.edu/~nkaldhol/lign101.html",
      "https://linguistics.ucsd.edu/people/alumni.html"
    ],
    "reviewGroup": 51
  },
  {
    "name": "Ilkbasaran, Deniz",
    "course": "LIGN/7",
    "initialProfileId": "1801596",
    "members": [
      {
        "id": "2498357",
        "name": "Deniz Ilkbasaran",
        "department": "Linguistics"
      },
      {
        "id": "1801596",
        "name": "Deniz Ilkbasaran",
        "department": "Communication"
      }
    ],
    "evidence": [
      "https://linguistics.ucsd.edu/people/lecturers.html",
      "https://linguistics.ucsd.edu/people/post-docs.html"
    ],
    "reviewGroup": 52
  },
  {
    "name": "Mohit Jain",
    "initialProfileId": "1990118",
    "ownerId": "direct-rmp-1990118",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "1990118",
        "name": "Mohit Jain",
        "department": "Medicine"
      },
      {
        "id": "1990119",
        "name": "Mohit Jain",
        "department": "Biological Sciences"
      }
    ],
    "evidence": [
      "https://bioinformatics.ucsd.edu/faculty/bmi",
      "https://www.bioinformatics.ucsd.edu/faculty"
    ],
    "reviewGroup": 53
  },
  {
    "name": "O'Brien, William Arctander",
    "course": "HUM/5",
    "initialProfileId": "94841",
    "members": [
      {
        "id": "2111230",
        "name": "William O'Brien",
        "department": "Humanities"
      },
      {
        "id": "94841",
        "name": "William O'Brien",
        "department": "Literature"
      }
    ],
    "evidence": [
      "https://literature.ucsd.edu/people/faculty/memoriam-wobrien.html",
      "https://literature.ucsd.edu/people/faculty/emeriti-wobrien.html"
    ],
    "reviewGroup": 54
  },
  {
    "name": "Somasundaram, Tyagarajan",
    "course": "MGT/112",
    "initialProfileId": "1088656",
    "members": [
      {
        "id": "2109026",
        "name": "Tyagarajan Somasundaram",
        "department": "Business"
      },
      {
        "id": "1088656",
        "name": "Tyagarajan Somasundaram",
        "department": "Management"
      }
    ],
    "evidence": [
      "https://rady.ucsd.edu/_files/faculty-research/cv/Somasundaram-2023-CV.pdf",
      "https://giving.ucsd.edu/_files/2012%20Honor%20Roll%20of%20Donors_2.26_Final2.pdf"
    ],
    "reviewGroup": 55
  },
  {
    "name": "Gibson, Carl H.",
    "course": "MAE/5",
    "initialProfileId": "497562",
    "members": [
      {
        "id": "2083911",
        "name": "Carl Gibson",
        "department": "Engineering"
      },
      {
        "id": "497562",
        "name": "Carl Gibson",
        "department": "Computer Science"
      }
    ],
    "evidence": [
      "https://mae.ucsd.edu/research-area/fluid-mechanics-%26-heat-transfer",
      "https://maeweb.ucsd.edu/faculty-profiles/emeriti"
    ],
    "reviewGroup": 56
  },
  {
    "name": "Minnes Kemp, Mor Mia",
    "course": "CSE/105",
    "initialProfileId": "1516842",
    "stubs": [
      {
        "id": "easy-a-mia-minnes-27428e5379",
        "name": "Mia Minnes"
      },
      {
        "id": "direct-rmp-1516842",
        "name": "Mia Minnes-Kemp",
        "sourceProfessorId": "1516842"
      }
    ],
    "ownerId": "easy-a-minnes-kemp-mor-mia-532e7edd24",
    "members": [
      {
        "id": "1815387",
        "name": "Mia Minnes",
        "department": "Mathematics"
      },
      {
        "id": "1516842",
        "name": "Mia Minnes-Kemp",
        "department": "Mathematics"
      },
      {
        "id": "2510448",
        "name": "mor mia Minnes Kemp",
        "department": "Computer Science"
      }
    ],
    "evidence": [
      "https://jacobsschool.ucsd.edu/people/profile/mia-minnes",
      "https://cse.ucsd.edu/undergraduate/spring-2026-undergraduate-course-updates"
    ],
    "reviewGroup": 57
  },
  {
    "name": "Wollman, Roy",
    "course": "CHEM/114B",
    "initialProfileId": "2133671",
    "ownerId": "easy-a-wollman-roy-69162e1d21",
    "members": [
      {
        "id": "2133686",
        "name": "Roy Wollman",
        "department": "Biological Sciences"
      },
      {
        "id": "2133671",
        "name": "Roy Wollman",
        "department": "Chemistry"
      }
    ],
    "evidence": [
      "https://chemistry.ucsd.edu/news/year/2012",
      "https://www-chem.ucsd.edu/news/year/2012"
    ],
    "reviewGroup": 58
  },
  {
    "name": "Smith, Jennifer",
    "course": "SIO/138",
    "initialProfileId": "2499159",
    "members": [
      {
        "id": "1884690",
        "name": "Jennifer Smith",
        "department": "Biology"
      },
      {
        "id": "2499159",
        "name": "Jennifer Smith",
        "department": "Oceanography"
      }
    ],
    "evidence": [
      "https://scripps.ucsd.edu/news/kelp-help-meet-scientists-working-restore-our-underwater-forests?trk=public_post_comment-text",
      "https://jes013.scrippsprofiles.ucsd.edu/biography/"
    ],
    "reviewGroup": 59
  },
  {
    "name": "Bronstein, Phoebe Malan",
    "course": "CAT/1",
    "initialProfileId": "2267758",
    "members": [
      {
        "id": "3024011",
        "name": "Phoebe Bronstein",
        "department": "Film"
      },
      {
        "id": "2267758",
        "name": "Phoebe Bronstein",
        "department": "English"
      }
    ],
    "evidence": [
      "https://sixth.ucsd.edu/cat/staff/phoebe-bronstein.html",
      "https://sixth.ucsd.edu/cat/staff/index.html"
    ],
    "reviewGroup": 61
  },
  {
    "name": "Fish, Gwendolyn Anne",
    "course": "SYN/1",
    "initialProfileId": "3104721",
    "members": [
      {
        "id": "3064857",
        "name": "Gwendolyn Fish",
        "department": "English"
      },
      {
        "id": "3104721",
        "name": "Gwendolyn Fish",
        "department": "Writing"
      }
    ],
    "evidence": [
      "https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?sections=527745&selectedTerm=FA24&tabNum=tabs-sec",
      "https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?sections=22197&selectedTerm=WI26&tabNum=tabs-sec"
    ],
    "reviewGroup": 62
  },
  {
    "name": "Henter, Heather J.",
    "course": "BIEB/121",
    "initialProfileId": "960592",
    "members": [
      {
        "id": "2150214",
        "name": "Heather Henter",
        "department": "Biological Sciences"
      },
      {
        "id": "960592",
        "name": "Heather Henter",
        "department": "Biology"
      }
    ],
    "evidence": [
      "https://profiles.ucsd.edu/heather.henter",
      "https://environmentalstudies.ucsd.edu/people/core-lecturers"
    ],
    "reviewGroup": 64
  },
  {
    "name": "Pirino, Giorgia",
    "course": "BIEB/121",
    "initialProfileId": "2298660",
    "members": [
      {
        "id": "2391493",
        "name": "Giorgia Pirino",
        "department": "Biology"
      },
      {
        "id": "2298660",
        "name": "Giorgia Pirino",
        "department": "Biological Sciences"
      }
    ],
    "evidence": [
      "https://studyabroad.ucsd.edu/students/programs/global-seminars/galapagos.html",
      "https://pao.ucsd.edu/students/programs/global-seminars/galapagos.html"
    ],
    "reviewGroup": 65
  },
  {
    "name": "Justina Flavin",
    "initialProfileId": "1385113",
    "ownerId": "direct-rmp-1385113",
    "createIfMissing": true,
    "allowNoHistory": true,
    "members": [
      {
        "id": "1385113",
        "name": "Justina Flavin",
        "department": "Biology"
      },
      {
        "id": "1431255",
        "name": "Justina Flavin",
        "department": "Science"
      }
    ],
    "evidence": [
      "https://extendedstudies.ucsd.edu/about-us/instructors/flavin-justina",
      "https://extendedstudies.ucsd.edu/about-us/instructors"
    ],
    "reviewGroup": 66
  },
  {
    "name": "Stockwell, Sarah R",
    "course": "BIEB/100",
    "initialProfileId": "2058305",
    "members": [
      {
        "id": "3120312",
        "name": "Sarah Stockwell",
        "department": "Biology"
      },
      {
        "id": "2058305",
        "name": "Sarah Stockwell",
        "department": "Biological Sciences"
      }
    ],
    "evidence": [
      "https://biology.ucsd.edu/research/faculty/sstockwell",
      "https://profiles.ucsd.edu/sarah.stockwell"
    ],
    "reviewGroup": 67
  },
  {
    "name": "Gymrek, Melissa Ann",
    "course": "CSE/185",
    "initialProfileId": "2808962",
    "ownerId": "easy-a-gymrek-melissa-ann-976eca5422",
    "members": [
      {
        "id": "2917207",
        "name": "Melissa Gymrek",
        "department": "Biology"
      },
      {
        "id": "2808962",
        "name": "Melissa Gymrek",
        "department": "Computer Science"
      }
    ],
    "evidence": [
      "https://jacobsschool.ucsd.edu/faculty/profile?id=418",
      "https://igm.ucsd.edu/faculty/melissa-gymrek"
    ],
    "reviewGroup": 68
  },
  {
    "name": "McKay, Mary A",
    "course": "MGT/164",
    "initialProfileId": "1646258",
    "members": [
      {
        "id": "2735133",
        "name": "Mary McKay",
        "department": "Business"
      },
      {
        "id": "1646258",
        "name": "Mary McKay",
        "department": "Management"
      }
    ],
    "evidence": [
      "https://rady.ucsd.edu/faculty-research/other-faculty/continuing-lecturers/mary-mckay.html",
      "https://rady.ucsd.edu/faculty-research/faculty-directory/"
    ],
    "reviewGroup": 69
  },
  {
    "name": "Perols, Johan Lars",
    "course": "MGT/139",
    "initialProfileId": "2806949",
    "members": [
      {
        "id": "2916135",
        "name": "Johan Perols",
        "department": "Business"
      },
      {
        "id": "2806949",
        "name": "Johan Perols",
        "department": "Management"
      }
    ],
    "evidence": [
      "https://rady.ucsd.edu/faculty-research/other-faculty/lecturers/johan-perols.html",
      "https://rady.ucsd.edu/faculty-research/faculty-directory/"
    ],
    "reviewGroup": 70
  },
  {
    "name": "Petkas, Alexander J",
    "course": "HIEU/160",
    "initialProfileId": "2326593",
    "members": [
      {
        "id": "2326586",
        "name": "Alexander Petkas",
        "department": "Classics"
      },
      {
        "id": "2326593",
        "name": "Alexander Petkas",
        "department": "History"
      }
    ],
    "evidence": [
      "https://isp.ucsd.edu/_files/offerings/sp19_offerings/isp.sp19.lang.pdf"
    ],
    "reviewGroup": 71
  },
  {
    "name": "Klemmer, Scott R",
    "course": "COGS/10",
    "initialProfileId": "1882198",
    "ownerId": "easy-a-klemmer-scott-r-2aa88ad484",
    "stubs": [
      {
        "id": "easy-a-scott-klemmer-597b9610fd",
        "name": "Scott Klemmer"
      }
    ],
    "members": [
      {
        "id": "2465312",
        "name": "Scott Klemmer",
        "department": "Cognitive Science"
      },
      {
        "id": "1882198",
        "name": "Scott Klemmer",
        "department": "Cognitive Science & Computer Engineering"
      }
    ],
    "evidence": [
      "https://seventh.ucsd.edu/about/faculty/faculty-listing-by-schools.html"
    ],
    "reviewGroup": 72
  },
  {
    "name": "Chien, Shu",
    "course": "BENG/1",
    "initialProfileId": "1376830",
    "members": [
      {
        "id": "2348675",
        "name": "Shu Chien",
        "department": "Engineering"
      },
      {
        "id": "1376830",
        "name": "Shu Chien",
        "department": "Medicine"
      }
    ],
    "evidence": [
      "https://bioengineering.ucsd.edu/sites/default/files/annual_reports/2020/2020_BIOENG_Annual_Report_11.2.2020_compressed.pdf"
    ],
    "reviewGroup": 75
  },
  {
    "name": "Gudem, Prasad S.S.",
    "initialProfileId": "2979295",
    "allowNoHistory": true,
    "members": [
      {
        "id": "2947356",
        "name": "Prasad Gudem",
        "department": "Engineering"
      },
      {
        "id": "2979295",
        "name": "Prasad Gudem",
        "department": "Electrical Engineering & Computer Science"
      }
    ],
    "evidence": [
      "https://rfic.ucsd.edu/",
      "https://www.ece.ucsd.edu/people/faculty/adjunct"
    ],
    "reviewGroup": 76
  },
  {
    "name": "Irwin, Matthew Joseph",
    "course": "CAT/125",
    "initialProfileId": "3108111",
    "members": [
      {
        "id": "3106363",
        "name": "Matthew Irwin",
        "department": "Humanities"
      },
      {
        "id": "3108111",
        "name": "Matthew Irwin",
        "department": "English"
      }
    ],
    "evidence": [
      "https://sixth.ucsd.edu/_files/cat/2024-2025/spring/cat-125/spring-2025-cat-125-irwin.pdf",
      "https://sixth.ucsd.edu/_files/cat/2024-2025/fall/cat-125/fall-2024-cat-125-irwin.pdf"
    ],
    "reviewGroup": 78
  },
  {
    "name": "Cho, Hye Jin",
    "course": "LTKO/1A",
    "initialProfileId": "3056050",
    "ownerId": "easy-a-cho-hye-jin-6abb32875c",
    "members": [
      {
        "id": "3056051",
        "name": "Hyejin Cho",
        "department": "Languages"
      },
      {
        "id": "3056050",
        "name": "Hyejin Cho",
        "department": "Literature"
      }
    ],
    "evidence": [
      "https://literature.ucsd.edu/people/office-hours.html",
      "https://hh-literature.ucsd.edu/people/faculty/hcho.html"
    ],
    "reviewGroup": 79
  },
  {
    "name": "Johnston, Emily Ronay",
    "course": "DOC/1",
    "initialProfileId": "2418529",
    "members": [
      {
        "id": "2711550",
        "name": "Emily Johnston",
        "department": "Literature"
      },
      {
        "id": "2418529",
        "name": "Emily Johnston",
        "department": "Writing"
      }
    ],
    "evidence": [
      "https://marshall.ucsd.edu/_files/student-life/marshall-memos-uploads/WI21-W2-memos.htm",
      "https://lgbt.ucsd.edu/community/outlist.html"
    ],
    "reviewGroup": 80
  },
  {
    "name": "Vos, Stacie N.",
    "course": "INTL/190",
    "initialProfileId": "2982994",
    "members": [
      {
        "id": "2982996",
        "name": "Stacie Vos",
        "department": "Literature"
      },
      {
        "id": "2982994",
        "name": "Stacie Vos",
        "department": "English"
      }
    ],
    "evidence": [
      "https://isp.ucsd.edu/people/faculty-lecturers.html",
      "https://literature.ucsd.edu/grad-phd/alumni/index.html"
    ],
    "reviewGroup": 81
  },
  {
    "name": "Upadrashta, Pranav Kumar",
    "course": "MATH/109",
    "initialProfileId": "3067166",
    "members": [
      {
        "id": "3083279",
        "name": "Pranav Upadrashta",
        "department": "Mathematics"
      },
      {
        "id": "3067166",
        "name": "Pranav Upadrashta",
        "department": "Mathematics"
      }
    ],
    "evidence": [
      "https://math.ucsd.edu/sites/math.ucsd.edu/files/SP26%20TA%20DRAFT%20v3.pdf",
      "https://math.ucsd.edu/sites/math.ucsd.edu/files/SP26%20TA%20DRAFT%20v1.pdf"
    ],
    "reviewGroup": 83
  },
  {
    "name": "Medvetz, Thomas Matthew",
    "course": "SOCI/100",
    "initialProfileId": "1254370",
    "members": [
      {
        "id": "2713719",
        "name": "Thomas Medvetz",
        "department": "Social Science"
      },
      {
        "id": "1254370",
        "name": "Thomas Medvetz",
        "department": "Sociology"
      }
    ],
    "evidence": [
      "https://sociology.ucsd.edu/people/faculty/faculty%20members/thomas-medvetz.html",
      "https://sociology.ucsd.edu/people/faculty/faculty%20members/index.html"
    ],
    "reviewGroup": 85
  },
  {
    "name": "Wickland, Teo Akande",
    "course": "USP/177A",
    "initialProfileId": "3078626",
    "members": [
      {
        "id": "3078624",
        "name": "Teo Wickland",
        "department": "Urban Planning"
      },
      {
        "id": "3078626",
        "name": "Teo Wickland",
        "department": "Urban Studies"
      }
    ],
    "evidence": [
      "https://mdes.ucsd.edu/",
      "https://mdes.ucsd.edu/faculty/"
    ],
    "reviewGroup": 86
  },
  {
    "name": "Garcia, Kathryn Mary",
    "course": "CCE/1",
    "initialProfileId": "3077588",
    "members": [
      {
        "id": "3077598",
        "name": "Kathryn Garcia",
        "department": "Writing"
      },
      {
        "id": "3077588",
        "name": "Kathryn Garcia",
        "department": "English"
      }
    ],
    "evidence": [
      "https://eighth.ucsd.edu/engagement-program/our-team.html",
      "https://eighth.ucsd.edu/about/staff.html"
    ],
    "reviewGroup": 87
  }
];
