import {
  PrismaClient,
  AssessmentDomain,
  AssessmentPlatform,
  PatientStatus,
  EvaluationStatus,
  Severity,
  NarrativeSectionType,
  RecommendationCategory,
  Priority,
  InstrumentAudience,
  InstrumentAssignmentStatus,
  UserRole,
} from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  await prisma.recommendation.deleteMany()
  await prisma.narrativeSection.deleteMany()
  await prisma.diagnosticImpression.deleteMany()
  await prisma.report.deleteMany()
  await prisma.score.deleteMany()
  await prisma.subtest.deleteMany()
  await prisma.evaluationAssessment.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.instrumentAssignment.deleteMany()
  await prisma.instrumentResponse.deleteMany()
  await prisma.instrumentResult.deleteMany()
  await prisma.instrumentSession.deleteMany()
  await prisma.instrumentItem.deleteMany()
  await prisma.instrument.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash("password123", 10)

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@neuroclear.app",
      name: "System Admin",
      role: UserRole.ADMIN,
      passwordHash,
    },
  })

  const childPatient = await prisma.patient.create({
    data: {
      firstName: "Emma",
      lastName: "Thompson",
      dateOfBirth: new Date("2015-03-15"),
      referralSource: "School Counselor",
      status: PatientStatus.ACTIVE,
    },
  })

  const adolescentPatient = await prisma.patient.create({
    data: {
      firstName: "Noah",
      lastName: "Martin",
      dateOfBirth: new Date("2009-06-10"),
      referralSource: "Pediatrician",
      status: PatientStatus.ACTIVE,
    },
  })

  const adultPatient = await prisma.patient.create({
    data: {
      firstName: "Sophia",
      lastName: "Garcia",
      dateOfBirth: new Date("1993-11-02"),
      referralSource: "Self",
      status: PatientStatus.ACTIVE,
    },
  })

  const olderAdultPatient = await prisma.patient.create({
    data: {
      firstName: "William",
      lastName: "Johnson",
      dateOfBirth: new Date("1948-04-22"),
      referralSource: "Primary Care",
      status: PatientStatus.ACTIVE,
    },
  })

  await prisma.user.create({
    data: {
      email: "emma.patient@neuroclear.app",
      name: "Emma Thompson",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: childPatient.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "noah.adolescent@neuroclear.app",
      name: "Noah Martin",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: adolescentPatient.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "sophia.adult@neuroclear.app",
      name: "Sophia Garcia",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: adultPatient.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "william.senior@neuroclear.app",
      name: "William Johnson",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: olderAdultPatient.id,
    },
  })

  const likert = [
    { label: "Not at all", value: 0 },
    { label: "Several days", value: 1 },
    { label: "More than half the days", value: 2 },
    { label: "Nearly every day", value: 3 },
  ]

  const phq9 = await prisma.instrument.create({
    data: {
      slug: "phq9",
      name: "PHQ-9",
      description: "Patient Health Questionnaire-9 (Depression screener)",
      minAgeYears: 13,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Little interest or pleasure in doing things", options: likert },
          { order: 2, prompt: "Feeling down, depressed, or hopeless", options: likert },
          { order: 3, prompt: "Trouble falling or staying asleep, or sleeping too much", options: likert },
          { order: 4, prompt: "Feeling tired or having little energy", options: likert },
          { order: 5, prompt: "Poor appetite or overeating", options: likert },
          { order: 6, prompt: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: likert },
          { order: 7, prompt: "Trouble concentrating on things, such as reading the newspaper or watching television", options: likert },
          { order: 8, prompt: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", options: likert },
          { order: 9, prompt: "Thoughts that you would be better off dead or of hurting yourself in some way", options: likert },
        ],
      },
    },
  })

  const sdqOptions = [
    { label: "Not true", value: 0 },
    { label: "Somewhat true", value: 1 },
    { label: "Certainly true", value: 2 },
  ]

  const sdq = await prisma.instrument.create({
    data: {
      slug: "sdq",
      name: "SDQ (Short)",
      description: "Strengths and Difficulties Questionnaire (sample short form)",
      minAgeYears: 6,
      maxAgeYears: 12,
      audience: InstrumentAudience.PARENT,
      items: {
        create: [
          { order: 1, prompt: "Often loses temper", options: sdqOptions },
          { order: 2, prompt: "Generally obedient", options: sdqOptions },
          { order: 3, prompt: "Many worries", options: sdqOptions },
        ],
      },
    },
  })

  const emotionMasksOptions = [
    { label: "Happy", value: 0 },
    { label: "Sad", value: 1 },
    { label: "Angry", value: 2 },
    { label: "Scared", value: 3 },
  ]

  const emotionMasks = await prisma.instrument.create({
    data: {
      slug: "child-emotion-masks",
      name: "Emotion Masks (Child)",
      description: "A short emotion recognition activity",
      minAgeYears: 6,
      maxAgeYears: 12,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "A friend smiles and says they missed you.", options: emotionMasksOptions },
          { order: 2, prompt: "Someone breaks your toy on purpose.", options: emotionMasksOptions },
          { order: 3, prompt: "You hear a loud noise in the dark.", options: emotionMasksOptions },
          { order: 4, prompt: "You lose a game you really wanted to win.", options: emotionMasksOptions },
          { order: 5, prompt: "You get a surprise gift.", options: emotionMasksOptions },
        ],
      },
    },
  })

  const patternWeaving = await prisma.instrument.create({
    data: {
      slug: "child-pattern-weaving",
      name: "Pattern Weaving (Child)",
      description: "Visual reasoning and rule induction using simple patterns.",
      minAgeYears: 6,
      maxAgeYears: 12,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Look at the pattern: 🔴 🔵 🔴 🔵. What comes next?", options: [
            { label: "🔴 Red", value: 1 }, { label: "🔵 Blue", value: 0 }, { label: "🟢 Green", value: 0 }, { label: "🟡 Yellow", value: 0 }
          ]},
          { order: 2, prompt: "Look at the pattern: ☀️ 🌙 ⭐ ☀️ 🌙 [?]. What comes next?", options: [
            { label: "☀️ Sun", value: 0 }, { label: "🌙 Moon", value: 0 }, { label: "⭐ Star", value: 1 }, { label: "☁️ Cloud", value: 0 }
          ]},
          { order: 3, prompt: "Look at the pattern: ⬆️ ➡️ ⬇️ ⬅️ ⬆️ [?]. What comes next?", options: [
            { label: "⬆️ Up", value: 0 }, { label: "➡️ Right", value: 1 }, { label: "⬇️ Down", value: 0 }, { label: "⬅️ Left", value: 0 }
          ]},
        ],
      },
    },
  })

  const storySeeds = await prisma.instrument.create({
    data: {
      slug: "child-story-seeds",
      name: "Story Seeds (Child)",
      description: "Sequencing memory and comprehension.",
      minAgeYears: 6,
      maxAgeYears: 12,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Read carefully: The seed was planted. It rained. A sprout grew. The sun shone. A flower bloomed. What happened FIRST?", options: [
            { label: "A sprout grew", value: 0 }, { label: "The seed was planted", value: 1 }, { label: "A flower bloomed", value: 0 }
          ]},
          { order: 2, prompt: "What made the sprout grow?", options: [
            { label: "The wind", value: 0 }, { label: "Rain and sun", value: 1 }, { label: "The snow", value: 0 }
          ]},
          { order: 3, prompt: "What happened at the very end?", options: [
            { label: "The seed was planted", value: 0 }, { label: "A flower bloomed", value: 1 }, { label: "It rained", value: 0 }
          ]},
        ],
      },
    },
  })

  const breathBell = await prisma.instrument.create({
    data: {
      slug: "child-breath-bell",
      name: "Breath & Bell (Child)",
      description: "Attention and state recovery through guided reflection.",
      minAgeYears: 6,
      maxAgeYears: 12,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Take a deep breath in... and out. How does your body feel right now?", options: [
            { label: "Very wiggly", value: 0 }, { label: "A little wiggly", value: 1 }, { label: "Calm and still", value: 2 }, { label: "Very sleepy", value: 1 }
          ]},
          { order: 2, prompt: "Imagine you are holding a hot cup of cocoa. Blow on it slowly to cool it down. How easy was it to breathe out slowly?", options: [
            { label: "Very hard", value: 0 }, { label: "A little hard", value: 1 }, { label: "Easy", value: 2 }, { label: "Very easy", value: 3 }
          ]},
          { order: 3, prompt: "Listen to an imaginary bell: DING... wait for it to fade in your mind. Did you wait until it was completely quiet?", options: [
            { label: "No, I started thinking of other things", value: 0 }, { label: "Yes, I waited until it was quiet", value: 2 }
          ]},
        ],
      },
    },
  })

  const phqa = await prisma.instrument.create({
    data: {
      slug: "phqa",
      name: "PHQ-A (Short)",
      description: "Patient Health Questionnaire for Adolescents (sample short form)",
      minAgeYears: 13,
      maxAgeYears: 17,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Feeling down, depressed, or hopeless", options: likert },
          { order: 2, prompt: "Little interest or pleasure in doing things", options: likert },
          { order: 3, prompt: "Trouble concentrating", options: likert },
        ],
      },
    },
  })

  const uncertaintyCompass = await prisma.instrument.create({
    data: {
      slug: "teen-uncertainty-compass",
      name: "Uncertainty Compass",
      description: "Decision-making under uncertainty. Choose a path, learn from feedback.",
      minAgeYears: 13,
      maxAgeYears: 17,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "You find a mysterious box. Do you open it immediately or wait for instructions?", options: [
            { label: "Open immediately", value: 1 }, { label: "Wait for instructions", value: 0 }, { label: "Leave it alone", value: 0 }
          ]},
          { order: 2, prompt: "You are navigating a new city and get lost. Do you ask a stranger or use a map app?", options: [
            { label: "Ask a stranger", value: 1 }, { label: "Use map app", value: 0 }, { label: "Wander until I find it", value: 2 }
          ]},
          { order: 3, prompt: "A friend invites you to a party where you don't know anyone. Do you go?", options: [
            { label: "Yes, definitely", value: 1 }, { label: "No, too stressful", value: 0 }, { label: "Maybe, if they stay with me", value: 0 }
          ]},
        ],
      },
    },
  })

  const socialHarmony = await prisma.instrument.create({
    data: {
      slug: "teen-social-harmony",
      name: "Social Harmony vs Honesty",
      description: "Pragmatic language and context judgement.",
      minAgeYears: 13,
      maxAgeYears: 17,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "A friend asks if you like their new, very unusual haircut. You don't. What do you say?", options: [
            { label: "Be completely honest, even if it hurts", value: 0 }, { label: "Say it's interesting and unique", value: 1 }, { label: "Lie and say it's great", value: 0 }
          ]},
          { order: 2, prompt: "You see a classmate drop some money without noticing. What do you do?", options: [
            { label: "Pick it up and keep it", value: 0 }, { label: "Tell them immediately", value: 1 }, { label: "Leave it there", value: 0 }
          ]},
        ],
      },
    },
  })

  const rhythmMeter = await prisma.instrument.create({
    data: {
      slug: "teen-rhythm-meter",
      name: "Rhythm & Meter",
      description: "Working memory and cognitive flexibility under load.",
      minAgeYears: 13,
      maxAgeYears: 17,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Memorize this sequence: 1-4-2-8. Now, what was the third number?", options: [
            { label: "1", value: 0 }, { label: "4", value: 0 }, { label: "2", value: 1 }, { label: "8", value: 0 }
          ]},
          { order: 2, prompt: "Tap the odd number: 2, 6, 7, 10", options: [
            { label: "2", value: 0 }, { label: "6", value: 0 }, { label: "7", value: 1 }, { label: "10", value: 0 }
          ]},
        ],
      },
    },
  })

  const ethicsMotion = await prisma.instrument.create({
    data: {
      slug: "teen-ethics-motion",
      name: "Ethics in Motion",
      description: "Dilemma reasoning. There is no 'right' answer, just your perspective.",
      minAgeYears: 13,
      maxAgeYears: 17,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "You promised to help a friend move, but get a chance to go to a concert you really wanted to see. What do you do?", options: [
            { label: "Help the friend (Loyalty)", value: 1 }, { label: "Go to concert (Self-interest)", value: 1 }, { label: "Try to do both poorly", value: 1 }
          ]},
        ],
      },
    },
  })

  const asrsOptions = [
    { label: "Never", value: 0 },
    { label: "Rarely", value: 1 },
    { label: "Sometimes", value: 2 },
    { label: "Often", value: 3 },
    { label: "Very Often", value: 4 },
  ]

  const asrs = await prisma.instrument.create({
    data: {
      slug: "asrs",
      name: "ASRS (Short)",
      description: "Adult ADHD Self-Report Scale (sample short form)",
      minAgeYears: 18,
      maxAgeYears: 64,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Trouble wrapping up final details of a project", options: asrsOptions },
          { order: 2, prompt: "Difficulty getting things in order", options: asrsOptions },
          { order: 3, prompt: "Problems remembering appointments", options: asrsOptions },
        ],
      },
    },
  })

  const gdsOptions = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 },
  ]

  const gds15 = await prisma.instrument.create({
    data: {
      slug: "gds15",
      name: "GDS-15 (Short)",
      description: "Geriatric Depression Scale (sample short form)",
      minAgeYears: 65,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Are you basically satisfied with your life?", options: gdsOptions },
          { order: 2, prompt: "Do you feel that your life is empty?", options: gdsOptions },
          { order: 3, prompt: "Do you often feel helpless?", options: gdsOptions },
        ],
      },
    },
  })

  const gad7 = await prisma.instrument.create({
    data: {
      slug: "gad7",
      name: "GAD-7",
      description: "Generalized Anxiety Disorder 7-item screener",
      minAgeYears: 13,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Feeling nervous, anxious or on edge", options: likert },
          { order: 2, prompt: "Not being able to stop or control worrying", options: likert },
          { order: 3, prompt: "Worrying too much about different things", options: likert },
          { order: 4, prompt: "Trouble relaxing", options: likert },
          { order: 5, prompt: "Being so restless that it is hard to sit still", options: likert },
          { order: 6, prompt: "Becoming easily annoyed or irritable", options: likert },
          { order: 7, prompt: "Feeling afraid as if something awful might happen", options: likert },
        ],
      },
    },
  })

  const auditOptions = [
    { label: "Never", value: 0 },
    { label: "Monthly or less", value: 1 },
    { label: "2–4 times a month", value: 2 },
    { label: "2–3 times a week", value: 3 },
  ]

  const audit = await prisma.instrument.create({
    data: {
      slug: "audit",
      name: "AUDIT",
      description: "Alcohol Use Disorders Identification Test (WHO)",
      minAgeYears: 18,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "How often do you have a drink containing alcohol?", options: auditOptions },
          { order: 2, prompt: "How many drinks containing alcohol do you have on a typical day when you are drinking?", options: [
            { label: "1 or 2", value: 0 },
            { label: "3 or 4", value: 1 },
            { label: "5 or 6", value: 2 },
            { label: "7 to 9", value: 3 },
          ] },
          { order: 3, prompt: "How often do you have six or more drinks on one occasion?", options: auditOptions },
          { order: 4, prompt: "How often during the last year have you found that you were not able to stop drinking once you had started?", options: auditOptions },
          { order: 5, prompt: "How often during the last year have you failed to do what was normally expected from you because of drinking?", options: auditOptions },
          { order: 6, prompt: "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?", options: auditOptions },
          { order: 7, prompt: "How often during the last year have you had a feeling of guilt or remorse after drinking?", options: auditOptions },
          { order: 8, prompt: "How often during the last year have you been unable to remember what happened the night before because you had been drinking?", options: auditOptions },
          { order: 9, prompt: "Have you or someone else been injured because of your drinking?", options: [
            { label: "No", value: 0 },
            { label: "Yes, but not in the last year", value: 2 },
            { label: "Yes, during the last year", value: 3 },
            { label: "Prefer not to say", value: 0 },
          ] },
          { order: 10, prompt: "Has a relative, friend, doctor, or other health worker been concerned about your drinking or suggested you cut down?", options: [
            { label: "No", value: 0 },
            { label: "Yes, but not in the last year", value: 2 },
            { label: "Yes, during the last year", value: 3 },
            { label: "Prefer not to say", value: 0 },
          ] },
        ],
      },
    },
  })

  const debateEvidence = await prisma.instrument.create({
    data: {
      slug: "adult-debate-evidence",
      name: "Debate & Evidence",
      description: "Argument evaluation and bias resistance.",
      minAgeYears: 18,
      maxAgeYears: 64,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Claim: 'This new diet is perfect because my neighbor lost 10 lbs on it.' What type of evidence is this?", options: [
            { label: "Strong scientific evidence", value: 0 }, { label: "Anecdotal evidence", value: 1 }, { label: "Statistical evidence", value: 0 }
          ]},
          { order: 2, prompt: "Claim: 'You can't trust his argument about the economy because he dresses sloppily.' This is an example of:", options: [
            { label: "Ad hominem (attacking the person)", value: 1 }, { label: "Logical deduction", value: 0 }, { label: "Valid critique", value: 0 }
          ]},
        ],
      },
    },
  })

  const cognitiveMarketplace = await prisma.instrument.create({
    data: {
      slug: "adult-cognitive-marketplace",
      name: "Cognitive Load Marketplace",
      description: "Planning under constraints (time/budget).",
      minAgeYears: 18,
      maxAgeYears: 64,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "You have $50 and 1 hour to prepare a dinner for 4. Which is the most efficient choice?", options: [
            { label: "Buy cheap ingredients and cook a simple stew ($20, 45 mins)", value: 2 }, { label: "Try a complex new recipe ($45, 90 mins)", value: 0 }, { label: "Order delivery ($55, 30 mins)", value: 1 }
          ]},
          { order: 2, prompt: "Your car breaks down on the way to a meeting. Priority 1 is:", options: [
            { label: "Call a tow truck", value: 1 }, { label: "Call the meeting organizer to inform them", value: 2 }, { label: "Try to fix the engine yourself", value: 0 }
          ]},
        ],
      },
    },
  })

  const temperamentBalance = await prisma.instrument.create({
    data: {
      slug: "adult-temperament-balance",
      name: "Temperament Balance",
      description: "Emotion regulation strategy selection.",
      minAgeYears: 18,
      maxAgeYears: 64,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "You receive a critical email from your boss. What is your immediate response?", options: [
            { label: "Reply angrily right away", value: 0 }, { label: "Take a walk, then reread it", value: 2 }, { label: "Ignore it", value: 1 }
          ]},
          { order: 2, prompt: "You are stuck in terrible traffic and running late. You choose to:", options: [
            { label: "Honk and yell at cars", value: 0 }, { label: "Listen to a podcast/music", value: 2 }, { label: "Worry about the consequences", value: 1 }
          ]},
        ],
      },
    },
  })

  const valuesCompass = await prisma.instrument.create({
    data: {
      slug: "adult-values-compass",
      name: "Values Compass",
      description: "Value clarity and goal alignment.",
      minAgeYears: 18,
      maxAgeYears: 64,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Which of these is most important to you right now?", options: [
            { label: "Career advancement", value: 1 }, { label: "Family and relationships", value: 1 }, { label: "Personal health", value: 1 }
          ]},
          { order: 2, prompt: "Does your current daily routine reflect this priority?", options: [
            { label: "Yes, completely", value: 2 }, { label: "Somewhat", value: 1 }, { label: "Not at all", value: 0 }
          ]},
        ],
      },
    },
  })

  const processingKindMode = await prisma.instrument.create({
    data: {
      slug: "senior-processing-kind",
      name: "Processing Speed - Kind Mode",
      description: "Accessible, low-stress processing speed matching.",
      minAgeYears: 65,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Find the matching symbol: ☀️", options: [
            { label: "🌙", value: 0 }, { label: "☀️", value: 1 }, { label: "⭐", value: 0 }
          ]},
          { order: 2, prompt: "Find the matching symbol: ☂️", options: [
            { label: "☂️", value: 1 }, { label: "🌧️", value: 0 }, { label: "❄️", value: 0 }
          ]},
        ],
      },
    },
  })

  const wisdomAmbiguity = await prisma.instrument.create({
    data: {
      slug: "senior-wisdom-ambiguity",
      name: "Wisdom Under Ambiguity",
      description: "Practical judgement in ambiguous social scenarios.",
      minAgeYears: 65,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "A younger relative cancels plans with you last minute without explanation. What is the most likely reason?", options: [
            { label: "They don't care about me", value: 0 }, { label: "They are avoiding me", value: 0 }, { label: "Something unexpected came up for them", value: 1 }
          ]},
          { order: 2, prompt: "You receive a confusing bill in the mail. What is your first step?", options: [
            { label: "Pay it immediately to avoid trouble", value: 0 }, { label: "Ignore it, it's probably a mistake", value: 0 }, { label: "Call the company or ask someone to help review it", value: 1 }
          ]},
        ],
      },
    },
  })

  const gentleAttention = await prisma.instrument.create({
    data: {
      slug: "senior-gentle-attention",
      name: "Gentle Attention",
      description: "Low-stress sustained attention task.",
      minAgeYears: 65,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "In the following list, how many times does the word 'APPLE' appear? (APPLE, PEAR, APPLE, ORANGE, BANANA)", options: [
            { label: "1", value: 0 }, { label: "2", value: 1 }, { label: "3", value: 0 }
          ]},
        ],
      },
    },
  })

  const lifeChapters = await prisma.instrument.create({
    data: {
      slug: "senior-life-chapters",
      name: "Life Chapters",
      description: "Autobiographical memory structure with scaffolds.",
      minAgeYears: 65,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Think of a challenge you overcame in your 20s or 30s. Which of these best describes what helped you through it?", options: [
            { label: "My own determination", value: 1 }, { label: "Support from family/friends", value: 1 }, { label: "A mentor or teacher", value: 1 }, { label: "Luck/circumstance", value: 1 }
          ]},
          { order: 2, prompt: "How clearly can you remember the details of that time?", options: [
            { label: "Very clearly", value: 2 }, { label: "Somewhat clearly", value: 1 }, { label: "Not very clearly", value: 0 }
          ]},
        ],
      },
    },
  })

  await prisma.instrumentAssignment.createMany({
    data: [
      {
        patientId: childPatient.id,
        instrumentId: sdq.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: childPatient.id,
        instrumentId: emotionMasks.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adolescentPatient.id,
        instrumentId: phqa.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: phq9.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: debateEvidence.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: cognitiveMarketplace.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: temperamentBalance.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: valuesCompass.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: gad7.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: audit.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: asrs.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: gds15.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: processingKindMode.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: wisdomAmbiguity.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: gentleAttention.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: lifeChapters.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
    ],
  })

  const wiscV = await prisma.assessment.create({
    data: {
      name: "WISC-V",
      domain: AssessmentDomain.COGNITIVE,
      platform: AssessmentPlatform.Q_INTERACTIVE,
      minAge: 6,
      maxAge: 16,
      description: "Wechsler Intelligence Scale for Children - Fifth Edition",
      subtests: {
        create: [
          { name: "Similarities", index: "VCI" },
          { name: "Vocabulary", index: "VCI" },
          { name: "Block Design", index: "VSI" },
          { name: "Visual Puzzles", index: "VSI" },
          { name: "Digit Span", index: "WMI" },
          { name: "Coding", index: "PSI" },
          { name: "Figure Weights", index: "FRI" },
        ],
      },
    },
  })

  const evaluation = await prisma.evaluation.create({
    data: {
      patientId: childPatient.id,
      assessmentId: wiscV.id,
      status: EvaluationStatus.COMPLETED,
      administeredDate: new Date("2024-01-15"),
      administeredBy: "Dr. Smith",
      notes: "Cooperative during testing.",
    },
  })

  const subtests = await prisma.subtest.findMany({
    where: { assessmentId: wiscV.id },
  })

  for (const s of subtests) {
    await prisma.score.create({
      data: {
        evaluationId: evaluation.id,
        subtestId: s.id,
        rawScore: Math.floor(Math.random() * 30) + 10,
        scaledScore: Math.floor(Math.random() * 10) + 5,
        percentile: Math.floor(Math.random() * 90) + 5,
      },
    })
  }

  await prisma.report.create({
    data: {
      evaluationId: evaluation.id,
      diagnosticImpressions: {
        create: [
          {
            dsm5Code: "F90.0",
            icd11Code: "6A01.0",
            severity: Severity.MODERATE,
            evidence:
              "Inattention symptoms observed during testing, parent and teacher ratings confirm clinical significance",
          },
        ],
      },
      narrativeSections: {
        create: [
          {
            section: NarrativeSectionType.REFERRAL,
            content:
              "Emma was referred for psychoeducational evaluation by her school counselor due to academic difficulties and attention problems.",
          },
          {
            section: NarrativeSectionType.BACKGROUND,
            content:
              "Emma is an 11-year-old student in 5th grade. Developmental milestones were met on time.",
          },
        ],
      },
      recommendations: {
        create: [
          {
            category: RecommendationCategory.ACADEMIC_ACCOMMODATIONS,
            description:
              "Extended time on tests and assignments (50% additional time)",
            priority: Priority.HIGH,
          },
        ],
      },
    },
  })

  console.log("Database seeded successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
