/**
 * Seed script — populates demo data for
 * "TECHNOVA 2026 – National Level Technical Symposium"
 *
 * Hosted by: KSR College of Engineering (KSRCE), Tiruchengode,
 *            Namakkal District, Tamil Nadu – 637 215
 *
 * Multi-day event: Apr 14–17 2026 (started before today, ends after today).
 * Day 1 (Apr 14) — completed  |  Day 2 (Apr 15) — completed
 * Day 3 (Apr 16) — live TODAY  |  Day 4 (Apr 17) — upcoming
 *
 * Covers every screen: registrations, guests, coordinators, stage,
 * schedule, budget, vendors, travel, checklists, announcements,
 * certificates, feedback, media, notifications.
 */

import {
  collection, addDoc, doc, writeBatch, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generateId } from '../lib/utils'

export type SeedLog = { msg: string; ok: boolean }

export async function seed(userUid?: string): Promise<{ eventId: string; logs: SeedLog[] }> {
  const logs: SeedLog[] = []
  const log = (msg: string, ok = true) => { logs.push({ msg, ok }); console.log(msg) }

  // ─── Event ────────────────────────────────────────────────────────────────
  const eventRef = await addDoc(collection(db, 'events'), {
    title: 'TECHNOVA 2026 – National Level Technical Symposium',
    description:
      'A flagship 4-day national technical symposium organised by KSR College of Engineering, Tiruchengode. TECHNOVA 2026 brings together researchers, industry veterans, and students from across India to explore frontiers in AI/ML, embedded systems, power electronics, structural engineering, and emerging technologies. Over 400 participants from 50+ institutions across Tamil Nadu, Karnataka, and Andhra Pradesh.',
    date: '2026-04-14',
    venue: 'KSR College of Engineering, Thokkavadi, Tiruchengode, Namakkal – 637 215',
    collegeName: 'KSR College of Engineering',
    status: 'active',
    createdBy: userUid || 'seed-admin',
    themeColor: '#1e3a8a',
    coverImageUrl: 'https://picsum.photos/seed/technova2026/1200/400',
    createdAt: serverTimestamp(),
  })
  const eventId = eventRef.id
  log(`Event created: ${eventId}`)

  // ─── Registrations (45) ──────────────────────────────────────────────────
  const regPeople = [
    // VIPs & Distinguished Guests
    { name: 'Dr. Ramachandran V.',       email: 'ramachandran@iitm.ac.in',     phone: '9444501001', designation: 'Professor & Dean (Research)', organization: 'IIT Madras',                         category: 'vip',         registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Jayakumar M.',          email: 'jayakumar@isro.gov.in',       phone: '9444501002', designation: 'Research Director',           organization: 'ISRO Sriharikota',                   category: 'vip',         registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Mr. Saravanan K.',          email: 'saravanan@lnttechservices.com',phone: '9444501003', designation: 'Vice President – R&D',        organization: 'L&T Technology Services, Chennai',   category: 'vip',         registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Thirumalai S.',         email: 'thirumalai@nit.ac.in',        phone: '9444501004', designation: 'Professor (ECE)',              organization: 'NIT Trichy',                         category: 'vip',         registrationType: 'invited',        paymentStatus: 'free', checkedIn: false },
    { name: 'Prof. Aravindhan R.',       email: 'aravindhan@annauniv.edu',     phone: '9444501005', designation: 'Professor & Controller of Exams', organization: 'Anna University, Chennai',        category: 'guest',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Chandrasekaran T.',     email: 'chandrasekaran@bosch.com',    phone: '9444501006', designation: 'Director – Engineering',       organization: 'Robert Bosch India, Coimbatore',     category: 'guest',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Vasanthakumari P.',     email: 'vasantha@amrita.edu',         phone: '9444501007', designation: 'Professor & HOD (IT)',         organization: 'Amrita University, Coimbatore',      category: 'guest',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Anbalagan M.',          email: 'principal@ksrce.ac.in',       phone: '9444501008', designation: 'Principal',                    organization: 'KSR College of Engineering',         category: 'vip',         registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },

    // Faculty – KSR Departments
    { name: 'Dr. Senthilkumar P.',       email: 'hodcse@ksrce.ac.in',          phone: '9444501009', designation: 'HOD – CSE',                    organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Karthikeyan R.',        email: 'hodece@ksrce.ac.in',          phone: '9444501010', designation: 'HOD – ECE',                    organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Muruganantham S.',      email: 'hodeee@ksrce.ac.in',          phone: '9444501011', designation: 'HOD – EEE',                    organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Subramaniam V.',        email: 'hodmech@ksrce.ac.in',         phone: '9444501012', designation: 'HOD – Mechanical',             organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Selvaraj C.',           email: 'hodcivil@ksrce.ac.in',        phone: '9444501013', designation: 'HOD – Civil',                  organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: false },
    { name: 'Dr. Thiruvenkatam N.',      email: 'hodit@ksrce.ac.in',           phone: '9444501014', designation: 'HOD – IT',                     organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Padmavathi K.',         email: 'hodaids@ksrce.ac.in',         phone: '9444501015', designation: 'HOD – AIDS',                   organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Dr. Gnanaprakasam J.',      email: 'hodaiml@ksrce.ac.in',         phone: '9444501016', designation: 'HOD – AIML',                   organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },

    // Student Coordinators – KSR
    { name: 'Murugan S.',                email: 'murugan.s@ksrce.ac.in',       phone: '9444501017', designation: 'B.E. CSE – IV Year',           organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Karthick M.',               email: 'karthick.m@ksrce.ac.in',      phone: '9444501018', designation: 'B.E. ECE – IV Year',           organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Senthil P.',                email: 'senthil.p@ksrce.ac.in',       phone: '9444501019', designation: 'B.E. EEE – III Year',          organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Priya D.',                  email: 'priya.d@ksrce.ac.in',         phone: '9444501020', designation: 'B.E. MECH – III Year',         organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Anbu R.',                   email: 'anbu.r@ksrce.ac.in',          phone: '9444501021', designation: 'B.E. CSE – IV Year',           organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Divya K.',                  email: 'divya.k@ksrce.ac.in',         phone: '9444501022', designation: 'B.Tech IT – III Year',         organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Ravi B.',                   email: 'ravi.b@ksrce.ac.in',          phone: '9444501023', designation: 'B.Tech AIDS – III Year',        organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Meena T.',                  email: 'meena.t@ksrce.ac.in',         phone: '9444501024', designation: 'B.Tech AIML – II Year',         organization: 'KSR College of Engineering',         category: 'volunteer',   registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },

    // External Participants
    { name: 'Suriya Prakash R.',         email: 'suriya@kongu.edu',            phone: '9444501025', designation: 'B.E. CSE – IV Year',           organization: 'Kongu Engineering College, Erode',   category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Nirmala Devi S.',           email: 'nirmala@srec.ac.in',          phone: '9444501026', designation: 'M.E. VLSI Design',             organization: 'Sri Ramakrishna Engg College, CBE',  category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Gowtham P.',                email: 'gowtham@bannari.ac.in',       phone: '9444501027', designation: 'B.E. EEE – III Year',          organization: 'Bannari Amman Institute of Tech',    category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: false },
    { name: 'Kavitha R.',                email: 'kavitha.r@erode.ac.in',       phone: '9444501028', designation: 'B.Sc. Computer Science',        organization: 'Erode Arts & Science College',       category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Muthu Kumaran V.',          email: 'muthukumar@salem.edu',        phone: '9444501029', designation: 'M.Tech Structural Engg',        organization: 'Salem College of Engg & Tech',       category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Tamilselvan G.',            email: 'tamilselvan@cit.ac.in',       phone: '9444501030', designation: 'B.E. Mech – IV Year',          organization: 'CIT Coimbatore',                     category: 'participant', registrationType: 'pre-registered', paymentStatus: 'free', checkedIn: true  },
    { name: 'Brinda Devi M.',            email: 'brinda@psgtech.edu',          phone: '9444501031', designation: 'PhD Scholar (AI)',              organization: 'PSG College of Technology, CBE',     category: 'participant', registrationType: 'pre-registered', paymentStatus: 'free', checkedIn: true  },
    { name: 'Arun Prabhu N.',            email: 'arun@vit.ac.in',              phone: '9444501032', designation: 'M.Tech Data Science',          organization: 'VIT University, Vellore',            category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Sangeetha L.',              email: 'sangeetha@srmist.edu',        phone: '9444501033', designation: 'PhD Scholar (Power Systems)',   organization: 'SRM Institute of Science & Tech',    category: 'participant', registrationType: 'pre-registered', paymentStatus: 'free', checkedIn: false },
    { name: 'Vinoth Kumar A.',           email: 'vinoth@auceg.ac.in',          phone: '9444501034', designation: 'B.E. Civil – IV Year',         organization: 'Anna University CEG, Chennai',       category: 'participant', registrationType: 'walk-in',        paymentStatus: 'free', checkedIn: false },
    { name: 'Renuga Devi P.',            email: 'renuga@mepco.ac.in',          phone: '9444501035', designation: 'Asst. Professor (ECE)',         organization: 'Mepco Schlenk Engg College, Sivakasi',category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Dharmaraj K.',              email: 'dharmaraj@licet.ac.in',       phone: '9444501036', designation: 'B.E. CSE – III Year',          organization: 'Loyola-ICAM College of Engg, Chennai',category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Padmini V.',                email: 'padmini@kumaraguru.edu',      phone: '9444501037', designation: 'M.E. Computer Science',         organization: 'Kumaraguru College of Tech, CBE',    category: 'participant', registrationType: 'pre-registered', paymentStatus: 'paid', checkedIn: true  },
    { name: 'Elavazhagan T.',            email: 'elava@saec.ac.in',            phone: '9444501038', designation: 'B.E. EEE – IV Year',           organization: 'Sri Aravindar Engineering College',  category: 'participant', registrationType: 'walk-in',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Kalamani R.',               email: 'kalamani@ksrce.ac.in',        phone: '9444501039', designation: 'Asst. Professor (AIML)',        organization: 'KSR College of Engineering',         category: 'participant', registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Vijayalakshmi S.',          email: 'vijayalakshmi@jkkn.ac.in',   phone: '9444501040', designation: 'Asst. Professor (Maths)',       organization: 'JKKN College of Engineering, Namakkal', category: 'participant', registrationType: 'pre-registered', paymentStatus: 'free', checkedIn: false },
    // Media
    { name: 'Suresh Babu J.',            email: 'suresh@dinamalar.com',        phone: '9444501041', designation: 'Reporter',                     organization: 'Dinamalar, Salem Edition',           category: 'media',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Malathi N.',                email: 'malathi@thehindu.com',        phone: '9444501042', designation: 'Correspondent',                organization: 'The Hindu, Namakkal',                category: 'media',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Palani P.',                 email: 'palani@jayatv.in',            phone: '9444501043', designation: 'Cameraman',                    organization: 'Jaya TV, Salem',                     category: 'media',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: false },
    { name: 'Suganya M.',                email: 'suganya@polimernews.com',     phone: '9444501044', designation: 'Reporter',                     organization: 'Polimer News, Erode',                category: 'media',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
    { name: 'Ganesan R.',                email: 'ganesan@namakal.daily',       phone: '9444501045', designation: 'Chief Reporter',               organization: 'Namakkal Daily, Namakkal',           category: 'media',       registrationType: 'invited',        paymentStatus: 'free', checkedIn: true  },
  ]

  const regIds: string[] = []
  for (const p of regPeople) {
    const ref = await addDoc(collection(db, 'events', eventId, 'registrations'), {
      ...p,
      qrToken: generateId(),
      eventId,
      badgePrinted: p.checkedIn,
      certificateIssued: false,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    regIds.push(ref.id)
  }
  log('Registrations seeded (45)')

  // ─── Guests (10 VIP guests) ──────────────────────────────────────────────
  const guests = [
    {
      name: 'Dr. Ramachandran V.', designation: 'Professor & Dean (Research)', organization: 'IIT Madras',
      contactNumber: '9444501001', email: 'ramachandran@iitm.ac.in',
      arrivalDateTime: '2026-04-13T19:30', departureDateTime: '2026-04-17T21:00',
      arrivalMode: 'train', trainNumber: '12637 – Pandian SF Express',
      pickupRequired: true, pickupAssignedTo: 'Murugan S. – 9444501017',
      pickupVehicleDetails: 'Toyota Innova – TN 29 AM 7788', pickupVolunteerContact: '9444501017',
      stayRequired: true, hotelName: 'Hotel Saravana Palace, Tiruchengode', roomNumber: '101',
      checkIn: '2026-04-13', checkOut: '2026-04-18',
      stayBookedBy: 'Anbu R.',
      dietaryPreference: 'veg',
      giftHandover: { shawl: true, gift: true, memento: true, handedBy: 'Karthick M.' },
      status: 'arrived', sessionSlot: 'Keynote – AI & Machine Learning Frontiers',
    },
    {
      name: 'Dr. Jayakumar M.', designation: 'Research Director', organization: 'ISRO Sriharikota',
      contactNumber: '9444501002', email: 'jayakumar@isro.gov.in',
      arrivalDateTime: '2026-04-14T08:00', departureDateTime: '2026-04-17T16:00',
      arrivalMode: 'flight', flightNumber: '6E 7421 (Chennai → Coimbatore)',
      pickupRequired: true, pickupAssignedTo: 'Karthick M. – 9444501018',
      pickupVehicleDetails: 'Mahindra Scorpio – TN 29 BK 4455', pickupVolunteerContact: '9444501018',
      stayRequired: true, hotelName: 'Hotel Saravana Palace, Tiruchengode', roomNumber: '102',
      checkIn: '2026-04-14', checkOut: '2026-04-18',
      stayBookedBy: 'Anbu R.',
      dietaryPreference: 'veg',
      giftHandover: { shawl: true, gift: true, memento: true, handedBy: 'Murugan S.' },
      status: 'arrived', sessionSlot: 'Special Address – Space Technology & ISRO Missions',
    },
    {
      name: 'Mr. Saravanan K.', designation: 'Vice President – R&D', organization: 'L&T Technology Services',
      contactNumber: '9444501003', email: 'saravanan@lnttechservices.com',
      arrivalDateTime: '2026-04-15T09:30', departureDateTime: '2026-04-16T18:00',
      arrivalMode: 'cab',
      pickupRequired: false,
      stayRequired: true, hotelName: 'KSR International Hotel, Namakkal', roomNumber: '201',
      checkIn: '2026-04-15', checkOut: '2026-04-17',
      stayBookedBy: 'Divya K.',
      dietaryPreference: 'non-veg',
      giftHandover: { shawl: true, gift: false, memento: true, handedBy: 'Priya D.' },
      status: 'arrived', sessionSlot: 'Industry Talk – Industry 4.0 & Smart Manufacturing',
    },
    {
      name: 'Dr. Thirumalai S.', designation: 'Professor (ECE)', organization: 'NIT Trichy',
      contactNumber: '9444501004', email: 'thirumalai@nit.ac.in',
      arrivalDateTime: '2026-04-16T07:30', departureDateTime: '2026-04-17T14:00',
      arrivalMode: 'bus', busDetails: 'TNSTC Express – Trichy → Tiruchengode',
      pickupRequired: true, pickupAssignedTo: 'Senthil P. – 9444501019',
      pickupVehicleDetails: 'Maruti Ertiga – TN 29 CL 9900', pickupVolunteerContact: '9444501019',
      stayRequired: true, hotelName: 'Hotel Saravana Palace, Tiruchengode', roomNumber: '103',
      checkIn: '2026-04-16', checkOut: '2026-04-18',
      stayBookedBy: 'Anbu R.',
      dietaryPreference: 'veg',
      giftHandover: { shawl: false, gift: false, memento: false },
      status: 'confirmed', sessionSlot: 'Technical Session – VLSI & Embedded Systems',
    },
    {
      name: 'Prof. Aravindhan R.', designation: 'Professor & Controller of Exams', organization: 'Anna University',
      contactNumber: '9444501005', email: 'aravindhan@annauniv.edu',
      arrivalDateTime: '2026-04-14T10:00', departureDateTime: '2026-04-16T20:00',
      arrivalMode: 'train', trainNumber: '12175 – Coimbatore Fast Passenger',
      pickupRequired: true, pickupAssignedTo: 'Murugan S. – 9444501017',
      pickupVehicleDetails: 'Toyota Innova – TN 29 AM 7788', pickupVolunteerContact: '9444501017',
      stayRequired: true, hotelName: 'KSR International Hotel, Namakkal', roomNumber: '202',
      checkIn: '2026-04-14', checkOut: '2026-04-17',
      stayBookedBy: 'Divya K.',
      dietaryPreference: 'veg',
      giftHandover: { shawl: true, gift: true, memento: false, handedBy: 'Anbu R.' },
      status: 'arrived', sessionSlot: 'Inaugural Address',
    },
    {
      name: 'Dr. Chandrasekaran T.', designation: 'Director – Engineering', organization: 'Robert Bosch India',
      contactNumber: '9444501006', email: 'chandrasekaran@bosch.com',
      arrivalDateTime: '2026-04-15T10:00', departureDateTime: '2026-04-16T17:30',
      arrivalMode: 'self',
      pickupRequired: false,
      stayRequired: false,
      dietaryPreference: 'non-veg',
      giftHandover: { shawl: true, gift: true, memento: true, handedBy: 'Priya D.' },
      status: 'arrived', sessionSlot: 'Industry Talk – EV Systems & Power Electronics',
    },
    {
      name: 'Dr. Vasanthakumari P.', designation: 'Professor & HOD (IT)', organization: 'Amrita University',
      contactNumber: '9444501007', email: 'vasantha@amrita.edu',
      arrivalDateTime: '2026-04-14T11:00', departureDateTime: '2026-04-17T09:30',
      arrivalMode: 'self',
      pickupRequired: false,
      stayRequired: true, hotelName: 'Hotel Saravana Palace, Tiruchengode', roomNumber: '104',
      checkIn: '2026-04-14', checkOut: '2026-04-17',
      stayBookedBy: 'Divya K.',
      dietaryPreference: 'veg',
      giftHandover: { shawl: false, gift: false, memento: false },
      status: 'arrived', sessionSlot: 'Technical Session – Data Science & Analytics',
    },
    {
      name: 'Dr. Anbalagan M.', designation: 'Principal', organization: 'KSR College of Engineering',
      contactNumber: '9444501008', email: 'principal@ksrce.ac.in',
      arrivalDateTime: '2026-04-14T08:00', departureDateTime: '2026-04-17T19:00',
      arrivalMode: 'self',
      pickupRequired: false,
      stayRequired: false,
      dietaryPreference: 'veg',
      giftHandover: { shawl: false, gift: false, memento: false },
      status: 'arrived',
    },
    {
      name: 'Brinda Devi M.', designation: 'PhD Scholar (AI)', organization: 'PSG College of Technology',
      contactNumber: '9444501031', email: 'brinda@psgtech.edu',
      arrivalDateTime: '2026-04-14T09:00', departureDateTime: '2026-04-17T15:00',
      arrivalMode: 'bus', busDetails: 'Private bus – CBE to Tiruchengode',
      pickupRequired: false,
      stayRequired: false,
      dietaryPreference: 'veg',
      giftHandover: { shawl: false, gift: false, memento: false },
      status: 'arrived', sessionSlot: 'Best Paper Award presenter',
    },
    {
      name: 'Arun Prabhu N.', designation: 'M.Tech Data Science', organization: 'VIT University',
      contactNumber: '9444501032', email: 'arun@vit.ac.in',
      arrivalDateTime: '2026-04-15T07:30', departureDateTime: '2026-04-17T11:00',
      arrivalMode: 'train', trainNumber: '22625 – KCG SF Express',
      pickupRequired: true, pickupAssignedTo: 'Ravi B. – 9444501023',
      pickupVehicleDetails: 'Maruti Ertiga – TN 29 CL 9900', pickupVolunteerContact: '9444501023',
      stayRequired: false,
      dietaryPreference: 'non-veg',
      giftHandover: { shawl: false, gift: false, memento: false },
      status: 'arrived', sessionSlot: 'Paper Presentation – Deep Learning in Medical Imaging',
    },
  ]

  for (const g of guests) {
    await addDoc(collection(db, 'events', eventId, 'guests'), {
      ...g, eventId, createdAt: serverTimestamp(),
    })
  }
  log('Guests seeded (10)')

  // ─── Coordinators / Quadinators (10) ─────────────────────────────────────
  const quads = [
    {
      name: 'Murugan S.', email: 'murugan.s@ksrce.ac.in', phone: '9444501017',
      assignedQuad: 'VIP Guest Reception & Escort', shiftStart: '06:00', shiftEnd: '21:00',
      responsibilities: ['Airport/Railway pickup coordination', 'VIP lounge management', 'Guest welcome & felicitation', 'Hotel check-in assistance'],
      teamMembers: [{ name: 'Karthick M.', phone: '9444501018', role: 'Pickup Driver Liaison' }, { name: 'Senthil P.', phone: '9444501019', role: 'Guest Escort' }],
      reportingTo: userUid || 'event-admin',
      department: 'CSE',
    },
    {
      name: 'Anbu R.', email: 'anbu.r@ksrce.ac.in', phone: '9444501021',
      assignedQuad: 'Registration & Badge Desk', shiftStart: '07:00', shiftEnd: '14:00',
      responsibilities: ['Walk-in registration', 'Badge printing & distribution', 'Kit bag handover', 'QR code check-in'],
      teamMembers: [{ name: 'Kavitha R.', phone: '9444501028', role: 'Registration Volunteer' }, { name: 'Elavazhagan T.', phone: '9444501038', role: 'QR Scanner' }],
      reportingTo: userUid || 'event-admin',
      department: 'CSE',
    },
    {
      name: 'Divya K.', email: 'divya.k@ksrce.ac.in', phone: '9444501022',
      assignedQuad: 'Hotel & Accommodation', shiftStart: '07:30', shiftEnd: '22:00',
      responsibilities: ['Hotel booking coordination', 'Room allocation & check-in', 'Guest comfort & amenities', 'Check-out assistance'],
      teamMembers: [{ name: 'Padmini V.', phone: '9444501037', role: 'Accommodation Volunteer' }],
      reportingTo: userUid || 'event-admin',
      department: 'IT',
    },
    {
      name: 'Karthick M.', email: 'karthick.m@ksrce.ac.in', phone: '9444501018',
      assignedQuad: 'Main Stage, AV & Live Streaming', shiftStart: '07:00', shiftEnd: '21:00',
      responsibilities: ['Stage setup & AV coordination', 'Speaker slide management', 'Live YouTube streaming', 'Lighting & sound cue management'],
      teamMembers: [{ name: 'Suriya Prakash R.', phone: '9444501025', role: 'AV Operator' }, { name: 'Gowtham P.', phone: '9444501027', role: 'Stage Assistant' }],
      reportingTo: userUid || 'event-admin',
      department: 'ECE',
    },
    {
      name: 'Priya D.', email: 'priya.d@ksrce.ac.in', phone: '9444501020',
      assignedQuad: 'Catering & F&B Zone', shiftStart: '07:00', shiftEnd: '19:00',
      responsibilities: ['Catering vendor coordination', 'VIP dining table setup', 'Dietary requirement management', 'Tea break & snacks timing'],
      teamMembers: [{ name: 'Nirmala Devi S.', phone: '9444501026', role: 'F&B Volunteer' }, { name: 'Sangeetha L.', phone: '9444501033', role: 'Dietary Coordinator' }],
      reportingTo: userUid || 'event-admin',
      department: 'Mechanical',
    },
    {
      name: 'Senthil P.', email: 'senthil.p@ksrce.ac.in', phone: '9444501019',
      assignedQuad: 'Transport & Travel Coordination', shiftStart: '05:30', shiftEnd: '23:00',
      responsibilities: ['Airport & railway pickup', 'Vehicle & driver allocation', 'Drop scheduling', 'Emergency cab booking'],
      teamMembers: [{ name: 'Muthu Kumaran V.', phone: '9444501029', role: 'Driver Liaison' }, { name: 'Tamilselvan G.', phone: '9444501030', role: 'Travel Volunteer' }],
      reportingTo: userUid || 'event-admin',
      department: 'EEE',
    },
    {
      name: 'Ravi B.', email: 'ravi.b@ksrce.ac.in', phone: '9444501023',
      assignedQuad: 'Technical Sessions – CSE / AIDS / AIML Halls', shiftStart: '08:30', shiftEnd: '18:30',
      responsibilities: ['Hall setup & seating', 'Paper presentation timer', 'Presenter coordination', 'Session feedback collection'],
      teamMembers: [{ name: 'Dharmaraj K.', phone: '9444501036', role: 'Session Marshal' }, { name: 'Kalamani R.', phone: '9444501039', role: 'Session Timekeeper' }],
      reportingTo: userUid || 'event-admin',
      department: 'AIDS',
    },
    {
      name: 'Meena T.', email: 'meena.t@ksrce.ac.in', phone: '9444501024',
      assignedQuad: 'Media, Photography & Social Media', shiftStart: '08:00', shiftEnd: '20:00',
      responsibilities: ['Official photography coordination', 'Social media live updates', 'Video recording', 'Instagram & YouTube live'],
      teamMembers: [{ name: 'Suresh Babu J.', phone: '9444501041', role: 'Press Media Liaison' }, { name: 'Malathi N.', phone: '9444501042', role: 'Press Coordinator' }],
      reportingTo: userUid || 'event-admin',
      department: 'AIML',
    },
    {
      name: 'Dr. Senthilkumar P.', email: 'hodcse@ksrce.ac.in', phone: '9444501009',
      assignedQuad: 'Technical Programme Committee', shiftStart: '08:00', shiftEnd: '18:00',
      responsibilities: ['Session chair – AI/ML track', 'Best paper evaluation', 'Industry expert liaison', 'Programme booklet review'],
      teamMembers: [{ name: 'Dr. Padmavathi K.', phone: '9444501015', role: 'Co-Chair AIDS Track' }, { name: 'Dr. Gnanaprakasam J.', phone: '9444501016', role: 'Co-Chair AIML Track' }],
      reportingTo: userUid || 'event-admin',
      department: 'CSE',
    },
    {
      name: 'Dr. Karthikeyan R.', email: 'hodece@ksrce.ac.in', phone: '9444501010',
      assignedQuad: 'ECE / EEE / MECH Hall Management', shiftStart: '08:00', shiftEnd: '18:00',
      responsibilities: ['ECE technical session chair', 'Lab equipment coordination', 'Workshop supervision', 'VLSI demo setup'],
      teamMembers: [{ name: 'Dr. Muruganantham S.', phone: '9444501011', role: 'EEE Session Co-Chair' }, { name: 'Dr. Subramaniam V.', phone: '9444501012', role: 'Mech Session Co-Chair' }],
      reportingTo: userUid || 'event-admin',
      department: 'ECE',
    },
  ]

  for (const q of quads) {
    await addDoc(collection(db, 'events', eventId, 'quadinators'), {
      ...q, eventId, createdAt: serverTimestamp(),
    })
  }
  log('Coordinators seeded (10)')

  // ─── Schedule (22 slots, 4 days) ─────────────────────────────────────────
  const schedule = [
    // Day 1 — Apr 14 (completed)
    { day: 1, order: 1,  title: 'Registration & Kit Collection',                   category: 'break',        startTime: '08:00', endTime: '09:30', status: 'completed', venue: 'Main Lobby & Registration Hall' },
    { day: 1, order: 2,  title: 'Inauguration Ceremony – TECHNOVA 2026',           category: 'inauguration', startTime: '09:30', endTime: '10:30', status: 'completed', speakerName: 'Dr. Anbalagan M.', speakerDesignation: 'Principal, KSRCE', venue: 'KSR Auditorium (Capacity: 1500)' },
    { day: 1, order: 3,  title: 'Presidential Address',                            category: 'keynote',      startTime: '10:30', endTime: '11:00', status: 'completed', speakerName: 'Prof. Aravindhan R.', speakerDesignation: 'Controller of Exams, Anna University', venue: 'KSR Auditorium' },
    { day: 1, order: 4,  title: 'Keynote – AI & Machine Learning Frontiers',       category: 'keynote',      startTime: '11:00', endTime: '12:00', status: 'completed', speakerName: 'Dr. Ramachandran V.', speakerDesignation: 'Dean Research, IIT Madras', venue: 'KSR Auditorium', notes: 'Live streamed on KSRCE YouTube' },
    { day: 1, order: 5,  title: 'Lunch & Networking',                              category: 'break',        startTime: '12:00', endTime: '13:00', status: 'completed', venue: 'KSR Dining Hall – Block C' },
    { day: 1, order: 6,  title: 'Paper Presentations – CSE & AIDS Track (Batch A)', category: 'session',     startTime: '13:00', endTime: '15:30', status: 'completed', venue: 'Seminar Hall 1 (CSE Block)', mcName: 'Ravi B.' },
    { day: 1, order: 7,  title: 'Workshop – Python for Data Science',              category: 'session',      startTime: '13:00', endTime: '15:30', status: 'completed', venue: 'CSE Lab – Block A', notes: 'Max 60 participants. Python 3.11 pre-installed on lab systems.' },
    { day: 1, order: 8,  title: 'Cultural Evening – Kolattam, Silambam & Music',  category: 'cultural',     startTime: '18:00', endTime: '20:30', status: 'completed', venue: 'KSR Open Air Theatre', mcName: 'Meena T.' },

    // Day 2 — Apr 15 (completed)
    { day: 2, order: 9,  title: 'Industry Talk – Industry 4.0 & Smart Manufacturing', category: 'keynote',  startTime: '09:00', endTime: '10:00', status: 'completed', speakerName: 'Mr. Saravanan K.', speakerDesignation: 'VP R&D, L&T Technology Services', venue: 'KSR Auditorium' },
    { day: 2, order: 10, title: 'Industry Talk – EV Systems & Power Electronics',  category: 'keynote',      startTime: '10:15', endTime: '11:15', status: 'completed', speakerName: 'Dr. Chandrasekaran T.', speakerDesignation: 'Director Engineering, Robert Bosch India', venue: 'KSR Auditorium' },
    { day: 2, order: 11, title: 'Technical Session – Data Science & Analytics',    category: 'session',      startTime: '11:30', endTime: '13:00', status: 'completed', speakerName: 'Dr. Vasanthakumari P.', speakerDesignation: 'HOD IT, Amrita University', venue: 'Seminar Hall 2 (IT Block)' },
    { day: 2, order: 12, title: 'Lunch Break',                                     category: 'break',        startTime: '13:00', endTime: '14:00', status: 'completed', venue: 'KSR Dining Hall – Block C' },
    { day: 2, order: 13, title: 'Paper Presentations – ECE & EEE Track (Batch B)', category: 'session',     startTime: '14:00', endTime: '16:30', status: 'completed', venue: 'ECE Seminar Hall (ECE Block)', mcName: 'Karthick M.' },
    { day: 2, order: 14, title: 'Project Expo & Prototype Display',               category: 'networking',   startTime: '16:30', endTime: '18:00', status: 'completed', venue: 'KSR Main Exhibition Ground', notes: '42 student project prototypes from 8 departments' },

    // Day 3 — Apr 16 (TODAY)
    { day: 3, order: 15, title: 'Special Address – Space Technology & ISRO Missions', category: 'keynote',  startTime: '09:00', endTime: '10:00', status: 'completed', speakerName: 'Dr. Jayakumar M.', speakerDesignation: 'Research Director, ISRO Sriharikota', venue: 'KSR Auditorium', notes: 'Live streamed on KSRCE YouTube' },
    { day: 3, order: 16, title: 'Technical Session – VLSI & Embedded Systems',     category: 'session',      startTime: '10:15', endTime: '12:00', status: 'live', speakerName: 'Dr. Thirumalai S.', speakerDesignation: 'Professor ECE, NIT Trichy', venue: 'ECE Seminar Hall' },
    { day: 3, order: 17, title: 'Lunch Break',                                     category: 'break',        startTime: '12:00', endTime: '13:00', status: 'upcoming', venue: 'KSR Dining Hall – Block C' },
    { day: 3, order: 18, title: 'Hands-on Workshop – Arduino & IoT Sensors',       category: 'session',      startTime: '13:00', endTime: '15:30', status: 'upcoming', venue: 'ECE Lab – Block B', notes: 'Arduino Uno kits provided. Max 50 participants.' },
    { day: 3, order: 19, title: 'Paper Presentations – MECH & CIVIL Track',        category: 'session',      startTime: '13:00', endTime: '15:30', status: 'upcoming', venue: 'Seminar Hall 3 (MECH Block)', mcName: 'Priya D.' },
    { day: 3, order: 20, title: 'Tea Break & Industry Interaction',               category: 'networking',   startTime: '15:30', endTime: '16:00', status: 'upcoming', venue: 'KSR Foyer – Main Block' },

    // Day 4 — Apr 17 (upcoming)
    { day: 4, order: 21, title: 'Award Ceremony – Best Paper, Best Project & Innovator', category: 'award', startTime: '10:00', endTime: '11:30', status: 'upcoming', speakerName: 'Dr. Ramachandran V.', speakerDesignation: 'Dean Research, IIT Madras', venue: 'KSR Auditorium', notes: '3 Best Paper + 1 Best Project + 2 Innovator awards' },
    { day: 4, order: 22, title: 'Valedictory & Vote of Thanks – TECHNOVA 2026',   category: 'valedictory',  startTime: '11:30', endTime: '12:30', status: 'upcoming', speakerName: 'Dr. Anbalagan M.', speakerDesignation: 'Principal, KSR College of Engineering', venue: 'KSR Auditorium' },
  ]

  for (const slot of schedule) {
    await addDoc(collection(db, 'events', eventId, 'schedule'), {
      ...slot, eventId, createdAt: serverTimestamp(),
    })
  }
  log('Schedule seeded (22 slots across 4 days)')

  // ─── Budget (20 items) ────────────────────────────────────────────────────
  const budget = [
    { category: 'venue',         itemName: 'KSR Auditorium Maintenance & Setup (4 days)',       estimatedAmount: 80000,  actualAmount: 75000,  approvalStatus: 'approved', paymentMode: 'bank-transfer', paidBy: 'Principal Office, KSRCE',          date: '2026-03-20' },
    { category: 'venue',         itemName: 'Seminar Halls Hire – 3 Halls × 4 Days',             estimatedAmount: 40000,  actualAmount: 38000,  approvalStatus: 'approved', paymentMode: 'bank-transfer', paidBy: 'Principal Office, KSRCE',          date: '2026-03-20' },
    { category: 'venue',         itemName: 'Lab Hire – CSE & ECE Labs (2 days Workshop)',       estimatedAmount: 20000,  actualAmount: 18000,  approvalStatus: 'approved', paymentMode: 'cheque',        paidBy: 'Department Fund – CSE',            date: '2026-04-01' },
    { category: 'catering',      itemName: 'Breakfast – 4 Days × 400 Pax',                      estimatedAmount: 128000, actualAmount: 124000, approvalStatus: 'approved', paymentMode: 'upi',           paidBy: 'Sri Murugan Catering, Tiruchengode', date: '2026-04-14' },
    { category: 'catering',      itemName: 'Lunch – 4 Days × 400 Pax',                          estimatedAmount: 240000, actualAmount: 235000, approvalStatus: 'approved', paymentMode: 'upi',           paidBy: 'Sri Murugan Catering, Tiruchengode', date: '2026-04-14' },
    { category: 'catering',      itemName: 'Tea & Snacks – 10 Rounds × 400 Pax',               estimatedAmount: 40000,  actualAmount: 38500,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Priya D.',                          date: '2026-04-14' },
    { category: 'catering',      itemName: 'VIP Dining – Special Menu (4 days)',                estimatedAmount: 24000,  actualAmount: 22000,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Priya D.',                          date: '2026-04-14' },
    { category: 'decoration',    itemName: 'Main Stage & Podium Floral Decoration',             estimatedAmount: 55000,  actualAmount: 52000,  approvalStatus: 'approved', paymentMode: 'cheque',        paidBy: 'KSR Floral Decorators, Tiruchengode', date: '2026-04-12' },
    { category: 'decoration',    itemName: 'Welcome Gate Arch & Entrance Decor',                estimatedAmount: 18000,  actualAmount: 17500,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'KSR Floral Decorators, Tiruchengode', date: '2026-04-12' },
    { category: 'av',            itemName: 'PA System, Projectors & LED Wall (4 days)',         estimatedAmount: 72000,  actualAmount: 70000,  approvalStatus: 'approved', paymentMode: 'bank-transfer', paidBy: 'Namakkal AV Systems',               date: '2026-04-10' },
    { category: 'av',            itemName: 'Live Streaming Setup & YouTube Broadcast',          estimatedAmount: 15000,  actualAmount: 14000,  approvalStatus: 'approved', paymentMode: 'upi',           paidBy: 'Namakkal AV Systems',               date: '2026-04-10' },
    { category: 'printing',      itemName: 'Main Backdrop 50×25 ft + Stage Banner',            estimatedAmount: 22000,  actualAmount: 21500,  approvalStatus: 'approved', paymentMode: 'upi',           paidBy: 'Velmurugan Flex Printing, Namakkal', date: '2026-04-08' },
    { category: 'printing',      itemName: 'Roll-up Banners × 8, Directional Boards × 20',    estimatedAmount: 18000,  actualAmount: 17800,  approvalStatus: 'approved', paymentMode: 'upi',           paidBy: 'Velmurugan Flex Printing, Namakkal', date: '2026-04-08' },
    { category: 'printing',      itemName: 'Programme Booklets (500 copies)',                   estimatedAmount: 20000,  actualAmount: 0,      approvalStatus: 'pending',  paymentMode: 'cash',          paidBy: '',                                  date: '2026-04-16' },
    { category: 'printing',      itemName: 'Certificate Printing (450 copies, Gold Border)',   estimatedAmount: 13500,  actualAmount: 0,      approvalStatus: 'pending',  paymentMode: 'cash',          paidBy: '',                                  date: '2026-04-17' },
    { category: 'gifts',         itemName: 'Shawls × 15 (VIP Guests)',                          estimatedAmount: 15000,  actualAmount: 14800,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Department Fund',                   date: '2026-04-13' },
    { category: 'gifts',         itemName: 'Mementos & Gift Boxes – Speakers (12)',             estimatedAmount: 18000,  actualAmount: 17500,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Department Fund',                   date: '2026-04-13' },
    { category: 'gifts',         itemName: 'Prize Money – Best Paper (₹5k×3) + Best Project (₹5k)', estimatedAmount: 20000, actualAmount: 0, approvalStatus: 'approved', paymentMode: 'bank-transfer', paidBy: 'Principal Office, KSRCE',          date: '2026-04-17' },
    { category: 'accommodation', itemName: 'Hotel Saravana Palace – 5 Rooms × 5 Nights',       estimatedAmount: 50000,  actualAmount: 50000,  approvalStatus: 'approved', paymentMode: 'bank-transfer', paidBy: 'Principal Office, KSRCE',          date: '2026-04-11' },
    { category: 'accommodation', itemName: 'KSR International Hotel – 3 Rooms × 3 Nights',    estimatedAmount: 21000,  actualAmount: 21000,  approvalStatus: 'approved', paymentMode: 'bank-transfer', paidBy: 'Principal Office, KSRCE',          date: '2026-04-11' },
    { category: 'travel',        itemName: 'Guest Air Ticket Reimbursements (4 guests)',        estimatedAmount: 60000,  actualAmount: 0,      approvalStatus: 'pending',  paymentMode: 'bank-transfer', paidBy: '',                                  date: '2026-04-20' },
    { category: 'travel',        itemName: 'Vehicle Hire – Sakthi Transport (4 days)',          estimatedAmount: 28000,  actualAmount: 26500,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Senthil P.',                        date: '2026-04-14' },
    { category: 'misc',          itemName: 'Media Kit – Press Releases & USB Drives (10)',      estimatedAmount: 5000,   actualAmount: 4800,   approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Meena T.',                          date: '2026-04-13' },
    { category: 'misc',          itemName: 'Stationery, ID Cards, Lanyards & Name Badges',     estimatedAmount: 12000,  actualAmount: 11800,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Anbu R.',                           date: '2026-04-11' },
    { category: 'misc',          itemName: 'Generator Backup Hire (4 days)',                    estimatedAmount: 16000,  actualAmount: 15500,  approvalStatus: 'approved', paymentMode: 'cash',          paidBy: 'Principal Office, KSRCE',           date: '2026-04-13' },
  ]

  for (const item of budget) {
    await addDoc(collection(db, 'events', eventId, 'budget'), {
      ...item, eventId, description: '', createdAt: serverTimestamp(),
    })
  }
  log('Budget seeded (25 items)')

  // ─── Stage Requirements (15) ─────────────────────────────────────────────
  const stageReqs = [
    { category: 'audio',     itemName: 'Wireless Lapel Microphone',         quantity: 8,  unit: 'nos',  status: 'setup',     assignedVendor: 'Namakkal AV Systems', estimatedCost: 0,     description: 'For keynote speakers, session chairs & MC' },
    { category: 'audio',     itemName: 'Condenser Podium Microphone',        quantity: 3,  unit: 'nos',  status: 'setup',     assignedVendor: 'Namakkal AV Systems', estimatedCost: 0,     description: 'Main podium + 2 table mics for panel' },
    { category: 'audio',     itemName: 'Line Array PA Speaker System',       quantity: 1,  unit: 'set',  status: 'setup',     assignedVendor: 'Namakkal AV Systems', estimatedCost: 30000, description: 'KSR Auditorium – 1500 pax capacity' },
    { category: 'audio',     itemName: 'Wireless Handheld Microphone',       quantity: 4,  unit: 'nos',  status: 'setup',     assignedVendor: 'Namakkal AV Systems', estimatedCost: 0,     description: 'Audience Q&A sessions' },
    { category: 'visual',    itemName: 'Laser Projector 12000 Lumens',       quantity: 3,  unit: 'nos',  status: 'setup',     assignedVendor: 'Namakkal AV Systems', estimatedCost: 24000, description: 'Main screen + 2 side screens' },
    { category: 'visual',    itemName: 'LED Video Wall 20×12 ft',            quantity: 1,  unit: 'nos',  status: 'setup',     assignedVendor: 'Namakkal AV Systems', estimatedCost: 28000, description: 'Centre stage – behind podium' },
    { category: 'visual',    itemName: 'Live Streaming Camera Setup',        quantity: 1,  unit: 'set',  status: 'setup',     assignedVendor: 'Namakkal AV Systems', estimatedCost: 14000, description: '3-camera setup for YouTube & local display' },
    { category: 'lighting',  itemName: 'Moving Head Stage Lights',           quantity: 10, unit: 'nos',  status: 'checked',   assignedVendor: 'Vel Lighting, Salem', estimatedCost: 12000 },
    { category: 'lighting',  itemName: 'LED Par Can Wash Lights',            quantity: 16, unit: 'nos',  status: 'checked',   assignedVendor: 'Vel Lighting, Salem', estimatedCost: 5000 },
    { category: 'lighting',  itemName: 'Follow Spot Light',                  quantity: 2,  unit: 'nos',  status: 'delivered', assignedVendor: 'Vel Lighting, Salem', estimatedCost: 3000,  description: 'For cultural event night' },
    { category: 'furniture', itemName: 'VIP Chairs with Arm (Dais)',         quantity: 12, unit: 'nos',  status: 'setup',     estimatedCost: 0 },
    { category: 'furniture', itemName: 'Podium with KSRCE Branding',         quantity: 2,  unit: 'nos',  status: 'setup',     estimatedCost: 0, description: 'Main podium + side podium for MC' },
    { category: 'decor',     itemName: 'TECHNOVA 2026 Stage Backdrop 50×25 ft', quantity: 1, unit: 'set', status: 'setup',   assignedVendor: 'KSR Floral Decorators, Tiruchengode', estimatedCost: 22000,
      backdropDetails: { theme: 'Navy Blue & Orange KSR Theme', dimensions: '50×25 ft', printingVendor: 'Velmurugan Flex Printing, Namakkal', status: 'installed' } },
    { category: 'technical', itemName: 'HDMI/USB-C/VGA Adaptor Kit',         quantity: 12, unit: 'sets', status: 'checked',   estimatedCost: 2000,  description: 'For speaker laptops across all halls' },
    { category: 'safety',    itemName: 'Fire Extinguisher on Stage & Exits', quantity: 6,  unit: 'nos',  status: 'delivered', estimatedCost: 0,     description: 'As per Tamil Nadu fire safety norms – placed at all stage exits & halls' },
  ]

  for (const req of stageReqs) {
    await addDoc(collection(db, 'events', eventId, 'stageRequirements'), {
      ...req, eventId, createdAt: serverTimestamp(),
    })
  }
  log('Stage requirements seeded (15)')

  // ─── Vendors (10) ────────────────────────────────────────────────────────
  const vendors = [
    {
      name: 'Sri Murugan Catering Services',      category: 'catering',     contactPerson: 'Mr. Murugesan K.',   phone: '9788100011', email: 'srimurugan.catering@gmail.com',
      totalAmount: 432000, advancePaid: 200000, balanceDue: 232000, status: 'active', rating: 5,
      deliverables: ['Breakfast 400 pax × 4 days', 'Lunch 400 pax × 4 days', 'Tea & snacks × 10 rounds', 'VIP special menu dining', 'Separate vegetarian & non-veg counters'],
      address: '14, Omalur Road, Tiruchengode – 637 215',
    },
    {
      name: 'Namakkal AV Systems',                category: 'av',           contactPerson: 'Mr. Selvakumar P.',  phone: '9788100022', email: 'namakkalav@gmail.com',
      totalAmount: 87000, advancePaid: 40000, balanceDue: 47000, status: 'active', rating: 5,
      deliverables: ['PA system setup & live operation', 'Laser projectors × 3', 'LED video wall 20×12 ft', 'Live YouTube streaming 3-camera', 'On-site AV tech × 4 days'],
      address: '5/A, VSP Complex, Namakkal – 637 001',
    },
    {
      name: 'KSR Floral Decorators',              category: 'decoration',   contactPerson: 'Ms. Komalavalli R.', phone: '9788100033', email: 'ksrfloraldecorators@gmail.com',
      totalAmount: 73000, advancePaid: 35000, balanceDue: 38000, status: 'active', rating: 4,
      deliverables: ['Stage floral backdrop & arrangement', 'Welcome gate arch', 'Seminar hall floral decor × 3 halls', 'VIP dining table centrepieces × 15', 'Registration desk flower arrangement'],
      address: 'Shop 3, Mariamman Koil Street, Tiruchengode',
    },
    {
      name: 'Velmurugan Flex Printing, Namakkal', category: 'printing',     contactPerson: 'Mr. Velmurugan A.', phone: '9788100044', email: 'velmurugan.print@gmail.com',
      totalAmount: 40000, advancePaid: 20000, balanceDue: 20000, status: 'completed', rating: 4,
      deliverables: ['Main backdrop 50×25 ft – TECHNOVA 2026', 'Roll-up banners × 8', 'Directional flex boards × 20', 'ID card printing × 450', 'Department name boards × 8'],
      address: '28, Tiruchengode Bypass Road, Namakkal – 637 001',
    },
    {
      name: 'Sakthi Transport Services',          category: 'transport',    contactPerson: 'Mr. Sakthi Vel B.',  phone: '9788100055', email: 'sakthitransport@gmail.com',
      totalAmount: 28000, advancePaid: 14000, balanceDue: 14000, status: 'active', rating: 4,
      deliverables: ['Toyota Innova × 1 (4 days)', 'Mahindra Scorpio × 1 (4 days)', 'Maruti Ertiga × 1 (4 days)', 'Airport & railway pickup runs', '24×7 driver availability on call'],
      address: 'Opp. New Bus Stand, Tiruchengode – 637 215',
    },
    {
      name: 'Vel Lighting & Events, Salem',       category: 'decoration',   contactPerson: 'Mr. Velayutham D.', phone: '9788100066', email: 'vellighting@gmail.com',
      totalAmount: 20000, advancePaid: 10000, balanceDue: 10000, status: 'active', rating: 4,
      deliverables: ['Moving head lights × 10', 'LED par cans × 16', 'Follow spot lights × 2', 'Lighting operator on-site', 'Gobos & dynamic effects for cultural night'],
      address: '77, Shevapet, Salem – 636 002',
    },
    {
      name: 'Selvam Event Security, Namakkal',    category: 'security',     contactPerson: 'Mr. Selvam T.',     phone: '9788100077', email: 'selvamsecurity@gmail.com',
      totalAmount: 24000, advancePaid: 12000, balanceDue: 12000, status: 'active', rating: 4,
      deliverables: ['Security guards × 10 per day', 'Entry gate access control', 'VIP escort service', 'Parking management', 'CCTV camera monitoring'],
      address: '9, Railway Station Road, Namakkal – 637 001',
    },
    {
      name: 'Rajam Photography Studio, Tiruchengode', category: 'photography', contactPerson: 'Mr. Rajamani S.', phone: '9788100088', email: 'rajamphotography@gmail.com',
      totalAmount: 22000, advancePaid: 10000, balanceDue: 12000, status: 'active', rating: 5,
      deliverables: ['Official event photography × 4 days', 'Candid shots & stage photography', 'Group photo sessions', 'Same-day digital delivery', 'Drone aerial photography (Day 1 & 4)'],
      address: 'No.2, KSR Main Road, Tiruchengode',
    },
    {
      name: 'Thirumala Generators, Erode',        category: 'security',     contactPerson: 'Mr. Thirumala P.',  phone: '9788100099', email: 'thirumalagen@gmail.com',
      totalAmount: 16000, advancePaid: 8000,  balanceDue: 8000,  status: 'active', rating: 3,
      deliverables: ['125 KVA silent diesel generator', 'ATS panel for auto-changeover', 'Operator on-site × 4 days', 'Diesel refill included'],
      address: '34, Cauvery Nagar, Erode – 638 001',
    },
    {
      name: 'Namakkal Media Kit & Gifting',       category: 'printing',     contactPerson: 'Ms. Nirmala K.',    phone: '9788100000', email: 'nmkgifting@gmail.com',
      totalAmount: 5000,  advancePaid: 5000,  balanceDue: 0,     status: 'completed', rating: 4,
      deliverables: ['USB drives × 10 with event brochure', 'Printed press kits × 15', 'Branded bags for media'],
      address: '12, Erode Road, Namakkal',
    },
  ]

  for (const v of vendors) {
    await addDoc(collection(db, 'events', eventId, 'vendors'), {
      ...v, eventId, createdAt: serverTimestamp(),
    })
  }
  log('Vendors seeded (10)')

  // ─── Travel Records (12) ─────────────────────────────────────────────────
  const travel = [
    {
      personName: 'Dr. Ramachandran V.', personType: 'vip', personId: regIds[0] || '',
      mode: 'train', origin: 'Chennai (MAS)', destination: 'Salem (SA)',
      departureDateTime: '2026-04-13T17:10', arrivalDateTime: '2026-04-13T20:30',
      bookingReference: '12637 / PNR: 4521098765', bookingStatus: 'confirmed',
      pickupRequired: true,  pickupVehicle: 'Toyota Innova – TN 29 AM 7788', pickupDriver: 'Rajan', pickupContact: '9900001111',
      dropRequired: true,    dropVehicle: 'Toyota Innova – TN 29 AM 7788',
      travelCost: 650, reimbursable: true, pickupStatus: 'dropped_off',
      notes: 'Pickup from Salem Railway Station → Hotel Saravana Palace, Tiruchengode',
    },
    {
      personName: 'Dr. Jayakumar M.', personType: 'vip', personId: regIds[1] || '',
      mode: 'flight', origin: 'Chennai (MAA)', destination: 'Coimbatore (CJB)',
      departureDateTime: '2026-04-14T06:30', arrivalDateTime: '2026-04-14T07:35',
      bookingReference: '6E 7421', bookingStatus: 'confirmed',
      pickupRequired: true,  pickupVehicle: 'Mahindra Scorpio – TN 29 BK 4455', pickupDriver: 'Suresh', pickupContact: '9900002222',
      dropRequired: true,    dropVehicle: 'Mahindra Scorpio – TN 29 BK 4455',
      travelCost: 4800, reimbursable: true, pickupStatus: 'dropped_off',
      notes: 'Pickup from CJB Airport → KSRCE Tiruchengode (85 km, ~2 hrs)',
    },
    {
      personName: 'Mr. Saravanan K.', personType: 'vip', personId: regIds[2] || '',
      mode: 'cab', origin: 'Chennai (City)', destination: 'Tiruchengode',
      departureDateTime: '2026-04-15T06:00', arrivalDateTime: '2026-04-15T09:30',
      bookingReference: 'OLA Outstation – MUM9854', bookingStatus: 'confirmed',
      pickupRequired: false, dropRequired: true, dropVehicle: 'Cab booked by guest',
      travelCost: 5500, reimbursable: true, pickupStatus: 'dropped_off',
      notes: 'Self-arranged cab from Chennai. Drop arranged on April 16.',
    },
    {
      personName: 'Dr. Thirumalai S.', personType: 'guest', personId: regIds[3] || '',
      mode: 'bus', origin: 'Trichy (SETC Bus Stand)', destination: 'Tiruchengode',
      departureDateTime: '2026-04-16T05:30', arrivalDateTime: '2026-04-16T07:30',
      bookingReference: 'SETC Express – TN-38-N-2234', bookingStatus: 'confirmed',
      pickupRequired: true,  pickupVehicle: 'Maruti Ertiga – TN 29 CL 9900', pickupDriver: 'Kumar', pickupContact: '9900003333',
      dropRequired: true,    dropVehicle: 'Maruti Ertiga – TN 29 CL 9900',
      travelCost: 180, reimbursable: true, pickupStatus: 'scheduled',
      notes: 'Pickup from Tiruchengode Bus Stop → Hotel Saravana Palace',
    },
    {
      personName: 'Prof. Aravindhan R.', personType: 'guest', personId: regIds[4] || '',
      mode: 'train', origin: 'Chennai (MAS)', destination: 'Erode (ED)',
      departureDateTime: '2026-04-14T06:15', arrivalDateTime: '2026-04-14T11:00',
      bookingReference: '12175 / PNR: 5512349876', bookingStatus: 'confirmed',
      pickupRequired: true,  pickupVehicle: 'Toyota Innova – TN 29 AM 7788', pickupDriver: 'Rajan', pickupContact: '9900001111',
      dropRequired: true,    dropVehicle: 'Toyota Innova – TN 29 AM 7788',
      travelCost: 420, reimbursable: true, pickupStatus: 'dropped_off',
      notes: 'Pickup from Erode Railway Station → KSRCE (40 km)',
    },
    {
      personName: 'Dr. Chandrasekaran T.', personType: 'guest', personId: regIds[5] || '',
      mode: 'self', origin: 'Coimbatore Office', destination: 'KSRCE, Tiruchengode',
      departureDateTime: '2026-04-15T08:30', arrivalDateTime: '2026-04-15T10:00',
      bookingStatus: 'confirmed',
      pickupRequired: false, dropRequired: false,
      travelCost: 0, reimbursable: false, pickupStatus: 'dropped_off',
      notes: 'Self-drive from Bosch office, Coimbatore',
    },
    {
      personName: 'Dr. Vasanthakumari P.', personType: 'guest', personId: regIds[6] || '',
      mode: 'self', origin: 'Amrita University, Coimbatore', destination: 'KSRCE, Tiruchengode',
      departureDateTime: '2026-04-14T09:00', arrivalDateTime: '2026-04-14T11:00',
      bookingStatus: 'confirmed',
      pickupRequired: false, dropRequired: false,
      travelCost: 0, reimbursable: false, pickupStatus: 'dropped_off',
    },
    {
      personName: 'Brinda Devi M.', personType: 'speaker', personId: regIds[30] || '',
      mode: 'bus', origin: 'Coimbatore (Gandhipuram)', destination: 'Tiruchengode',
      departureDateTime: '2026-04-14T08:00', arrivalDateTime: '2026-04-14T09:45',
      bookingReference: 'TNSTC – Route 47B', bookingStatus: 'confirmed',
      pickupRequired: false, dropRequired: false,
      travelCost: 90, reimbursable: true, pickupStatus: 'dropped_off',
    },
    {
      personName: 'Arun Prabhu N.', personType: 'speaker', personId: regIds[31] || '',
      mode: 'train', origin: 'Vellore (KPD)', destination: 'Salem (SA)',
      departureDateTime: '2026-04-15T05:00', arrivalDateTime: '2026-04-15T08:30',
      bookingReference: '22625 / PNR: 7832145678', bookingStatus: 'confirmed',
      pickupRequired: true,  pickupVehicle: 'Maruti Ertiga – TN 29 CL 9900', pickupDriver: 'Kumar', pickupContact: '9900003333',
      dropRequired: false,
      travelCost: 310, reimbursable: true, pickupStatus: 'picked_up',
      notes: 'Pickup from Salem → Tiruchengode. Will arrange own return.',
    },
    {
      personName: 'Suriya Prakash R.', personType: 'staff', personId: regIds[24] || '',
      mode: 'bus', origin: 'Erode (Perundurai)', destination: 'Tiruchengode',
      departureDateTime: '2026-04-14T07:30', arrivalDateTime: '2026-04-14T08:15',
      bookingStatus: 'confirmed',
      pickupRequired: false, dropRequired: false,
      travelCost: 60, reimbursable: false, pickupStatus: 'dropped_off',
    },
    {
      personName: 'Sangeetha L.', personType: 'staff', personId: regIds[32] || '',
      mode: 'train', origin: 'Chennai (MAS)', destination: 'Namakkal (NMK)',
      departureDateTime: '2026-04-14T22:30', arrivalDateTime: '2026-04-15T05:30',
      bookingReference: '11013 / PNR: 9876123450', bookingStatus: 'confirmed',
      pickupRequired: true, pickupVehicle: 'Maruti Ertiga – TN 29 CL 9900', pickupDriver: 'Kumar', pickupContact: '9900003333',
      dropRequired: false,
      travelCost: 340, reimbursable: true, pickupStatus: 'picked_up',
    },
    {
      personName: 'Renuga Devi P.', personType: 'staff', personId: regIds[34] || '',
      mode: 'bus', origin: 'Sivakasi (Virudhunagar)', destination: 'Tiruchengode',
      departureDateTime: '2026-04-14T05:00', arrivalDateTime: '2026-04-14T10:30',
      bookingReference: 'SETC – TN-58-N-8890', bookingStatus: 'confirmed',
      pickupRequired: false, dropRequired: false,
      travelCost: 220, reimbursable: true, pickupStatus: 'dropped_off',
    },
  ]

  for (const t of travel) {
    await addDoc(collection(db, 'events', eventId, 'travel'), {
      ...t, eventId, createdAt: serverTimestamp(),
    })
  }
  log('Travel records seeded (12)')

  // ─── Announcements (10) ──────────────────────────────────────────────────
  const announcements = [
    {
      title: 'TECHNOVA 2026-க்கு வரவேற்கிறோம்! | Welcome to TECHNOVA 2026!',
      message: 'KSR College of Engineering-ல் நடைபெறும் TECHNOVA 2026-க்கு அனைவரையும் வரவேற்கிறோம். Registration desk is at the Main Lobby. Wi-Fi: KSRCE_TECHNOVA | Password: Tech@2026. For queries: Anbu R. – 9444501021.',
      targetAudience: 'all', channel: 'push', status: 'sent', sentBy: userUid || 'seed-admin',
      sentAt: serverTimestamp(),
    },
    {
      title: 'Day 1 Recap — Inauguration & Keynote Highlights',
      message: 'Day 1 was a grand success! The inauguration by Hon. Principal Dr. Anbalagan M. and keynote by Dr. Ramachandran V. (IIT Madras) on "AI & ML Frontiers" received a standing ovation. Day 2 begins at 09:00 with Industry Talk by Mr. Saravanan K. (L&T Tech). Please be seated by 08:50.',
      targetAudience: 'all', channel: 'push', status: 'sent', sentBy: userUid || 'seed-admin',
      sentAt: serverTimestamp(),
    },
    {
      title: 'ISRO Scientist Pickup Confirmed ✓',
      message: 'Pickup for Dr. Jayakumar M. (ISRO) from Coimbatore Airport confirmed. Vehicle: Mahindra Scorpio TN 29 BK 4455 | Driver: Suresh (9900002222). Quad Murugan S. – please confirm at the hotel check-in.',
      targetAudience: 'quadinators', channel: 'push', status: 'sent', sentBy: userUid || 'seed-admin',
      sentAt: serverTimestamp(),
    },
    {
      title: 'NIT Trichy Professor Pickup – Today Morning',
      message: 'Dr. Thirumalai S. (NIT Trichy) arrives at Tiruchengode Bus Stop at ~07:30 today (Apr 16). Senthil P. – please dispatch Ertiga TN 29 CL 9900 by 07:15. Confirm pickup via WhatsApp.',
      targetAudience: 'quadinators', channel: 'whatsapp', status: 'sent', sentBy: userUid || 'seed-admin',
      sentAt: serverTimestamp(),
    },
    {
      title: 'ISRO Special Address – LIVE NOW in KSR Auditorium',
      message: 'The Special Address on "Space Technology & ISRO Missions" by Dr. Jayakumar M. (Research Director, ISRO) is NOW LIVE in KSR Auditorium. Live stream also running on KSRCE YouTube. All participants please proceed to the auditorium.',
      targetAudience: 'all', channel: 'push', status: 'sent', sentBy: userUid || 'seed-admin',
      sentAt: serverTimestamp(),
    },
    {
      title: 'CSE & AIDS Departments – Session Coordinators Briefing',
      message: 'All session coordinators for CSE, AIDS, and AIML paper presentation tracks must report to Seminar Hall 1 by 12:30 today. Bring your evaluation sheets. Contact: Dr. Senthilkumar P. – 9444501009.',
      targetAudience: 'quadinators', channel: 'push', status: 'sent', sentBy: userUid || 'seed-admin',
      sentAt: serverTimestamp(),
    },
    {
      title: 'IoT Workshop – Arduino Kits Ready at ECE Lab',
      message: 'Reminder: Hands-on Arduino & IoT Sensors Workshop begins at 13:00 today in ECE Lab, Block B. All 50 Arduino Uno kits are ready. Participants must carry student ID. First-come first-served. Coordinator: Karthick M. – 9444501018.',
      targetAudience: 'all', channel: 'push', status: 'scheduled', sentBy: userUid || 'seed-admin',
      scheduledAt: '2026-04-16T12:30',
    },
    {
      title: 'Best Paper Award – Shortlist Announced',
      message: 'Best Paper Award shortlist for TECHNOVA 2026: (1) Brinda Devi M. – PSG Tech, (2) Arun Prabhu N. – VIT, (3) Renuga Devi P. – Mepco. Winners to be announced at the Award Ceremony on April 17. Congratulations!',
      targetAudience: 'all', channel: 'push', status: 'scheduled', sentBy: userUid || 'seed-admin',
      scheduledAt: '2026-04-16T18:00',
    },
    {
      title: 'Vendor Payment Reminder – Catering & AV',
      message: 'Final payment due: Sri Murugan Catering (₹2,32,000) and Namakkal AV Systems (₹47,000) on April 17 post-event. Principal Office please process bank transfers. Contact: Anbu R. for vendor details.',
      targetAudience: 'quadinators', channel: 'email', status: 'draft', sentBy: userUid || 'seed-admin',
    },
    {
      title: 'Day 4 Valedictory – All Coordinators Mandatory',
      message: 'All student coordinators MUST be present in KSR Auditorium by 09:30 on April 17 for the Award Ceremony and Valedictory function. Group photo of all coordinators and faculty at 12:45. Formal wear mandatory.',
      targetAudience: 'quadinators', channel: 'whatsapp', status: 'scheduled', sentBy: userUid || 'seed-admin',
      scheduledAt: '2026-04-17T08:00',
    },
  ]

  for (const a of announcements) {
    await addDoc(collection(db, 'events', eventId, 'announcements'), {
      ...a, eventId, createdAt: serverTimestamp(),
    })
  }
  log('Announcements seeded (10)')

  // ─── Checklists (4) ──────────────────────────────────────────────────────
  await addDoc(collection(db, 'events', eventId, 'checklist'), {
    title: 'Pre-Event Checklist – TECHNOVA 2026', category: 'pre-event', eventId,
    items: [
      { id: generateId(), task: 'KSR Auditorium & Seminar Hall booking confirmed',               status: 'done',    assignedTo: 'Principal Office, KSRCE',   dueDate: '2026-03-15' },
      { id: generateId(), task: 'Speaker invitation letters signed & dispatched',                 status: 'done',    assignedTo: 'Dr. Senthilkumar P.',        dueDate: '2026-02-28' },
      { id: generateId(), task: 'TECHNOVA 2026 backdrop design approved & sent to printer',       status: 'done',    assignedTo: 'Karthick M.',                dueDate: '2026-04-05' },
      { id: generateId(), task: 'Hotel bookings confirmed – Saravana Palace & KSR International', status: 'done',    assignedTo: 'Divya K.',                   dueDate: '2026-04-08' },
      { id: generateId(), task: 'Sri Murugan Catering – headcount & menu finalised',             status: 'done',    assignedTo: 'Priya D.',                   dueDate: '2026-04-10' },
      { id: generateId(), task: 'Namakkal AV Systems – equipment checklist signed',              status: 'done',    assignedTo: 'Karthick M.',                dueDate: '2026-04-08' },
      { id: generateId(), task: 'Gift procurement – shawls, mementos & prize cash envelopes',    status: 'done',    assignedTo: 'Murugan S.',                 dueDate: '2026-04-11' },
      { id: generateId(), task: 'Sakthi Transport – 3 vehicles confirmed for 4 days',            status: 'done',    assignedTo: 'Senthil P.',                 dueDate: '2026-04-10' },
      { id: generateId(), task: 'Volunteer orientation & briefing session at KSRCE',             status: 'done',    assignedTo: 'Anbu R.',                    dueDate: '2026-04-12' },
      { id: generateId(), task: 'Media invitations sent – Dinamalar, The Hindu, Jaya TV',       status: 'done',    assignedTo: 'Meena T.',                   dueDate: '2026-04-10' },
      { id: generateId(), task: 'Generator hire confirmed – Thirumala Generators',               status: 'done',    assignedTo: 'Principal Office, KSRCE',   dueDate: '2026-04-12' },
      { id: generateId(), task: 'Arduino IoT Workshop – 50 kits procured & tested',              status: 'done',    assignedTo: 'Dr. Karthikeyan R.',         dueDate: '2026-04-13' },
      { id: generateId(), task: 'Programme booklets – content proofread & sent to print',        status: 'pending', assignedTo: 'Karthick M.',                dueDate: '2026-04-16' },
    ],
    createdAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'events', eventId, 'checklist'), {
    title: 'Day-of-Event Checklist – Apr 14', category: 'day-of', eventId,
    items: [
      { id: generateId(), task: 'Registration desk operational by 07:30 (Anbu R. + team)',       status: 'done',    assignedTo: 'Anbu R.' },
      { id: generateId(), task: 'AV tested – PA, projectors, LED wall & live stream',            status: 'done',    assignedTo: 'Karthick M.' },
      { id: generateId(), task: 'TECHNOVA stage backdrop installed & verified',                  status: 'done',    assignedTo: 'Karthick M.' },
      { id: generateId(), task: 'All speaker slide decks received & loaded',                     status: 'done',    assignedTo: 'Karthick M.' },
      { id: generateId(), task: 'VIP pickups confirmed – Dr. Ramachandran from Salem',           status: 'done',    assignedTo: 'Murugan S.' },
      { id: generateId(), task: 'Dr. Jayakumar M. pickup from CJB Airport confirmed',            status: 'done',    assignedTo: 'Murugan S.' },
      { id: generateId(), task: 'Catering team on-site – breakfast setup by 07:30',              status: 'done',    assignedTo: 'Priya D.' },
      { id: generateId(), task: 'Selvam Security – 10 guards deployed at gates',                 status: 'done',    assignedTo: 'Dr. Anbalagan M.' },
      { id: generateId(), task: 'Rajam Photography briefed – positions assigned',                status: 'done',    assignedTo: 'Meena T.' },
      { id: generateId(), task: 'First-aid & medical standby – KSRCE Health Centre',            status: 'done',    assignedTo: 'Principal Office' },
      { id: generateId(), task: 'IoT Workshop – ECE Lab B: Arduino kits ready & tested',        status: 'pending', assignedTo: 'Dr. Karthikeyan R.',  dueDate: '2026-04-16' },
      { id: generateId(), task: 'Award certificates printed, laminated & sealed',               status: 'pending', assignedTo: 'Anbu R.',             dueDate: '2026-04-16' },
      { id: generateId(), task: 'Prize money cash envelopes prepared (₹5k × 4)',                status: 'pending', assignedTo: 'Principal Office',    dueDate: '2026-04-16' },
    ],
    createdAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'events', eventId, 'checklist'), {
    title: 'Department-wise Session Checklist', category: 'custom', eventId,
    items: [
      { id: generateId(), task: 'CSE Seminar Hall 1 – seating, projector & screen ready',       status: 'done',    assignedTo: 'Ravi B.' },
      { id: generateId(), task: 'ECE Seminar Hall – oscilloscope & VLSI demo kits ready',       status: 'done',    assignedTo: 'Dr. Karthikeyan R.' },
      { id: generateId(), task: 'EEE track – panel discussion chairs (6) arranged',             status: 'done',    assignedTo: 'Dr. Muruganantham S.' },
      { id: generateId(), task: 'MECH Seminar Hall 3 – CAD workstation demo setup',             status: 'done',    assignedTo: 'Dr. Subramaniam V.' },
      { id: generateId(), task: 'CIVIL Hall – structural model display stands ready',           status: 'done',    assignedTo: 'Dr. Selvaraj C.' },
      { id: generateId(), task: 'AIDS track – GPU workstations for ML demo (8 systems)',        status: 'done',    assignedTo: 'Dr. Padmavathi K.' },
      { id: generateId(), task: 'AIML track – Python & Jupyter environment tested',             status: 'done',    assignedTo: 'Dr. Gnanaprakasam J.' },
      { id: generateId(), task: 'IT Seminar Hall 2 – web dev workshop environment ready',       status: 'done',    assignedTo: 'Dr. Thiruvenkatam N.' },
      { id: generateId(), task: 'All session halls – attendance register printed',              status: 'done',    assignedTo: 'Anbu R.' },
      { id: generateId(), task: 'Best Paper judges briefed – Dr. Ramachandran + panel',        status: 'pending', assignedTo: 'Dr. Senthilkumar P.', dueDate: '2026-04-16' },
    ],
    createdAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'events', eventId, 'checklist'), {
    title: 'Post-Event Checklist', category: 'post-event', eventId,
    items: [
      { id: generateId(), task: 'E-certificates emailed to all registered participants',        status: 'pending', assignedTo: 'Anbu R.',              dueDate: '2026-04-20' },
      { id: generateId(), task: 'Feedback report compiled & submitted to HODs',                 status: 'pending', assignedTo: 'Dr. Senthilkumar P.',   dueDate: '2026-04-22' },
      { id: generateId(), task: 'Vendor payments settled & receipts filed',                     status: 'pending', assignedTo: 'Principal Office',      dueDate: '2026-04-25' },
      { id: generateId(), task: 'Guest travel reimbursements processed (4 guests)',             status: 'pending', assignedTo: 'Principal Office',      dueDate: '2026-04-25' },
      { id: generateId(), task: 'Event photos & videos archived to KSRCE Google Drive',        status: 'pending', assignedTo: 'Karthick M.',           dueDate: '2026-04-20' },
      { id: generateId(), task: 'KSR Auditorium handover & damage inspection done',             status: 'pending', assignedTo: 'Senthil P.',            dueDate: '2026-04-18' },
      { id: generateId(), task: 'TECHNOVA 2026 website – gallery & report uploaded',            status: 'pending', assignedTo: 'Ravi B.',               dueDate: '2026-04-22' },
      { id: generateId(), task: 'Sponsor & industry partner acknowledgement letters sent',      status: 'pending', assignedTo: 'Dr. Senthilkumar P.',   dueDate: '2026-04-22' },
      { id: generateId(), task: 'Event report with financials submitted to management',         status: 'pending', assignedTo: 'Principal Office',      dueDate: '2026-04-30' },
      { id: generateId(), task: 'Best paper full paper submission – IEEE Xplore proceedings',  status: 'pending', assignedTo: 'Dr. Senthilkumar P.',   dueDate: '2026-05-10' },
    ],
    createdAt: serverTimestamp(),
  })
  log('Checklists seeded (4)')

  // ─── Certificates (20) ───────────────────────────────────────────────────
  const certData = [
    { idx: 0,  recipientName: 'Dr. Ramachandran V.',   certType: 'felicitation'   },
    { idx: 1,  recipientName: 'Dr. Jayakumar M.',      certType: 'felicitation'   },
    { idx: 2,  recipientName: 'Mr. Saravanan K.',      certType: 'appreciation'   },
    { idx: 3,  recipientName: 'Dr. Thirumalai S.',     certType: 'appreciation'   },
    { idx: 4,  recipientName: 'Prof. Aravindhan R.',   certType: 'felicitation'   },
    { idx: 5,  recipientName: 'Dr. Chandrasekaran T.', certType: 'appreciation'   },
    { idx: 6,  recipientName: 'Dr. Vasanthakumari P.', certType: 'appreciation'   },
    { idx: 16, recipientName: 'Murugan S.',             certType: 'volunteer'      },
    { idx: 17, recipientName: 'Karthick M.',            certType: 'volunteer'      },
    { idx: 18, recipientName: 'Senthil P.',             certType: 'volunteer'      },
    { idx: 19, recipientName: 'Priya D.',               certType: 'volunteer'      },
    { idx: 20, recipientName: 'Anbu R.',                certType: 'volunteer'      },
    { idx: 21, recipientName: 'Divya K.',               certType: 'volunteer'      },
    { idx: 22, recipientName: 'Ravi B.',                certType: 'volunteer'      },
    { idx: 23, recipientName: 'Meena T.',               certType: 'volunteer'      },
    { idx: 30, recipientName: 'Brinda Devi M.',         certType: 'best-paper'     },
    { idx: 31, recipientName: 'Arun Prabhu N.',         certType: 'best-paper'     },
    { idx: 34, recipientName: 'Renuga Devi P.',         certType: 'best-paper'     },
    { idx: 24, recipientName: 'Suriya Prakash R.',      certType: 'participation'  },
    { idx: 26, recipientName: 'Kavitha R.',             certType: 'participation'  },
  ]

  for (const c of certData) {
    await addDoc(collection(db, 'events', eventId, 'certificates'), {
      recipientRegId: regIds[c.idx] || '',
      recipientName: c.recipientName,
      certType: c.certType,
      eventId,
      issuedAt: serverTimestamp(),
      issuedBy: userUid || 'seed-admin',
      templateUsed: 'ksrce-gold',
      emailed: c.certType === 'volunteer',
    })
  }
  log('Certificates seeded (20)')

  // ─── Feedback (12 responses) ─────────────────────────────────────────────
  const feedbackData = [
    {
      submittedBy: 'Suriya Prakash R.',   overallRating: 5, organizationRating: 5, hospitalityRating: 5, contentRating: 5,
      sessionRatings: { 'Keynote – AI/ML': 5, 'ISRO Address': 5 },
      suggestions: 'KSRCE has set a new benchmark for technical symposiums in the Namakkal district. Keep it up!',
      testimonial: 'The ISRO scientist\'s special address was phenomenal. First time I attended such a well-organised event from a Tiruchengode college.',
      approved: true,
    },
    {
      submittedBy: 'Nirmala Devi S.',     overallRating: 5, organizationRating: 4, hospitalityRating: 5, contentRating: 5,
      sessionRatings: { 'VLSI Session – NIT Trichy': 5, 'ECE Paper Presentations': 4 },
      suggestions: 'VLSI workshop should be a full-day hands-on session next year. Content was outstanding.',
      testimonial: 'Excellent event! The VLSI session by Dr. Thirumalai from NIT Trichy was highly technical and very informative.',
      approved: true,
    },
    {
      submittedBy: 'Arun Prabhu N.',      overallRating: 5, organizationRating: 5, hospitalityRating: 4, contentRating: 5,
      sessionRatings: { 'Industry Talk – L&T Tech': 5, 'Data Science Session': 5 },
      suggestions: 'Industry collaboration MoU signing would make this even more impactful.',
      testimonial: 'Best symposium I have attended in Tamil Nadu. The industry connect was excellent.',
      approved: true,
    },
    {
      submittedBy: 'Kavitha R.',          overallRating: 4, organizationRating: 4, hospitalityRating: 4, contentRating: 4,
      sessionRatings: { 'Python Workshop': 4, 'AI Keynote': 5 },
      suggestions: 'Registration queue on Day 1 was long. Digital pre-registration with QR entry would be better.',
      testimonial: 'Very good organisation for a 4-day event. Python workshop was practical and useful.',
      approved: true,
    },
    {
      submittedBy: 'Muthu Kumaran V.',    overallRating: 4, organizationRating: 5, hospitalityRating: 4, contentRating: 4,
      sessionRatings: { 'MECH Paper Presentations': 4, 'Industry 4.0 Talk': 5 },
      suggestions: 'Add a structural engineering hands-on lab session next year.',
      testimonial: 'TECHNOVA is a must-attend event for engineering students in the region.',
      approved: true,
    },
    {
      submittedBy: 'Tamilselvan G.',      overallRating: 3, organizationRating: 3, hospitalityRating: 4, contentRating: 4,
      sessionRatings: { 'EV Talk – Bosch': 4 },
      suggestions: 'The lunch queue on Day 2 was too long. Need better crowd management at canteen.',
      approved: false,
    },
    {
      submittedBy: 'Brinda Devi M.',      overallRating: 5, organizationRating: 5, hospitalityRating: 5, contentRating: 5,
      sessionRatings: { 'AI/ML Keynote': 5, 'Paper Presentation': 5 },
      suggestions: 'Best paper award process was very transparent and fair. Loved the gold-bordered certificates!',
      testimonial: 'KSRCE TECHNOVA 2026 is truly a national-level event. The quality of speakers was world-class.',
      approved: true,
    },
    {
      submittedBy: 'Renuga Devi P.',      overallRating: 5, organizationRating: 4, hospitalityRating: 5, contentRating: 5,
      sessionRatings: { 'VLSI Workshop': 5, 'IoT Workshop': 5 },
      suggestions: 'More paper presentation slots needed – many good papers couldn\'t be accommodated.',
      testimonial: 'Excellent event! KSR College is doing incredible work in building academic connections.',
      approved: true,
    },
    {
      submittedBy: 'Dharmaraj K.',        overallRating: 4, organizationRating: 4, hospitalityRating: 4, contentRating: 5,
      sessionRatings: { 'ISRO Address': 5, 'AI Keynote': 4 },
      suggestions: 'Provide notebook & pen in the kit bag. Some venues lacked chairs on Day 2.',
      testimonial: 'Dr. Jayakumar\'s ISRO talk was mind-blowing. I\'m motivated to pursue space research now.',
      approved: true,
    },
    {
      submittedBy: 'Padmini V.',          overallRating: 5, organizationRating: 5, hospitalityRating: 5, contentRating: 5,
      sessionRatings: { 'Data Science Session': 5, 'Industry 4.0': 5 },
      suggestions: 'Everything was perfect. A benchmark event for all engineering colleges in Kongu region.',
      testimonial: 'Professionally organized with excellent industry and academia representation.',
      approved: true,
    },
    {
      submittedBy: 'Elavazhagan T.',      overallRating: 4, organizationRating: 4, hospitalityRating: 3, contentRating: 4,
      sessionRatings: { 'Project Expo': 4 },
      suggestions: 'Food was good but the canteen space was too small for the number of participants. Try outdoor tents.',
      testimonial: 'Project Expo was my favourite part! Great innovation from all 8 departments.',
      approved: true,
    },
    {
      submittedBy: 'Vijayalakshmi S.',    overallRating: 3, organizationRating: 3, hospitalityRating: 3, contentRating: 4,
      sessionRatings: { 'AI Keynote': 5 },
      suggestions: 'Wi-Fi was too slow on Day 2 evening. Parking space needs improvement.',
      approved: false,
    },
  ]

  for (const fb of feedbackData) {
    await addDoc(collection(db, 'events', eventId, 'feedback'), {
      ...fb, eventId, submittedAt: serverTimestamp(),
    })
  }
  log('Feedback seeded (12)')

  // ─── Media (20 files) ────────────────────────────────────────────────────
  const mediaFiles = [
    { album: 'Inauguration',         fileName: 'inauguration_lamp_lighting.jpg',      fileUrl: 'https://picsum.photos/seed/ksr01/800/600', fileType: 'image', size: 312000, description: 'Principal Dr. Anbalagan M. lighting the inaugural lamp' },
    { album: 'Inauguration',         fileName: 'dignitaries_on_dais.jpg',             fileUrl: 'https://picsum.photos/seed/ksr02/800/600', fileType: 'image', size: 285000, description: 'All dignitaries & HODs on the KSR Auditorium dais' },
    { album: 'Inauguration',         fileName: 'felicitation_ceremony.jpg',           fileUrl: 'https://picsum.photos/seed/ksr03/800/600', fileType: 'image', size: 340000, description: 'Felicitation of Dr. Ramachandran V. with shawl & memento' },
    { album: 'Day 1 – Keynote',      fileName: 'iit_madras_keynote.jpg',              fileUrl: 'https://picsum.photos/seed/ksr04/800/600', fileType: 'image', size: 298000, description: 'Dr. Ramachandran V. delivering AI/ML keynote at KSR Auditorium' },
    { album: 'Day 1 – Keynote',      fileName: 'full_audience_auditorium.jpg',        fileUrl: 'https://picsum.photos/seed/ksr05/800/600', fileType: 'image', size: 456000, description: 'KSR Auditorium packed to 1500 capacity during keynote' },
    { album: 'Day 1 – Cultural',     fileName: 'kolattam_performance.jpg',            fileUrl: 'https://picsum.photos/seed/ksr06/800/600', fileType: 'image', size: 523000, description: 'KSRCE students performing Kolattam at open air theatre' },
    { album: 'Day 1 – Cultural',     fileName: 'silambam_cultural_night.jpg',         fileUrl: 'https://picsum.photos/seed/ksr07/800/600', fileType: 'image', size: 398000, description: 'Traditional Silambam performance during cultural evening' },
    { album: 'Day 2 – Industry',     fileName: 'lt_tech_industry_talk.jpg',           fileUrl: 'https://picsum.photos/seed/ksr08/800/600', fileType: 'image', size: 267000, description: 'Mr. Saravanan K. – Industry 4.0 & Smart Manufacturing talk' },
    { album: 'Day 2 – Industry',     fileName: 'bosch_ev_session.jpg',               fileUrl: 'https://picsum.photos/seed/ksr09/800/600', fileType: 'image', size: 289000, description: 'Dr. Chandrasekaran from Bosch India on EV Systems' },
    { album: 'Day 2 – Project Expo', fileName: 'project_expo_display.jpg',            fileUrl: 'https://picsum.photos/seed/ksr10/800/600', fileType: 'image', size: 512000, description: '42 student project prototypes displayed at KSRCE Exhibition Ground' },
    { album: 'Day 2 – Project Expo', fileName: 'robo_prototype_cse.jpg',             fileUrl: 'https://picsum.photos/seed/ksr11/800/600', fileType: 'image', size: 334000, description: 'CSE department robotic arm prototype' },
    { album: 'Day 3 – ISRO',         fileName: 'isro_scientist_address.jpg',          fileUrl: 'https://picsum.photos/seed/ksr12/800/600', fileType: 'image', size: 445000, description: 'Dr. Jayakumar M. from ISRO Sriharikota on stage' },
    { album: 'Day 3 – ISRO',         fileName: 'isro_talk_auditorium_crowd.jpg',     fileUrl: 'https://picsum.photos/seed/ksr13/800/600', fileType: 'image', size: 490000, description: 'Overflowing audience during ISRO special address' },
    { album: 'Day 3 – Workshop',     fileName: 'iot_arduino_workshop.jpg',            fileUrl: 'https://picsum.photos/seed/ksr14/800/600', fileType: 'image', size: 276000, description: 'Students working on Arduino IoT kits in ECE Lab Block B' },
    { album: 'Registration',         fileName: 'registration_desk_day1.jpg',          fileUrl: 'https://picsum.photos/seed/ksr15/800/600', fileType: 'image', size: 210000, description: 'Registration desk setup at KSRCE Main Lobby – Day 1 morning' },
    { album: 'Registration',         fileName: 'badge_distribution.jpg',              fileUrl: 'https://picsum.photos/seed/ksr16/800/600', fileType: 'image', size: 232000, description: 'Anbu R. and team distributing TECHNOVA 2026 badges' },
    { album: 'Awards',               fileName: 'best_paper_award.jpg',               fileUrl: 'https://picsum.photos/seed/ksr17/800/600', fileType: 'image', size: 378000, description: 'Best Paper Award ceremony – Brinda Devi M. receiving award from Principal' },
    { album: 'Awards',               fileName: 'prize_distribution.jpg',             fileUrl: 'https://picsum.photos/seed/ksr18/800/600', fileType: 'image', size: 362000, description: 'Prize money distribution – Best Project winners from MECH dept' },
    { album: 'Group Photos',         fileName: 'all_coordinators_group.jpg',          fileUrl: 'https://picsum.photos/seed/ksr19/800/600', fileType: 'image', size: 634000, description: 'Group photo of all 10 coordinators with HODs after valedictory' },
    { album: 'Group Photos',         fileName: 'faculty_and_guest_speakers.jpg',      fileUrl: 'https://picsum.photos/seed/ksr20/800/600', fileType: 'image', size: 598000, description: 'KSRCE Faculty, HODs & all guest speakers group photo – KSR Auditorium' },
  ]

  for (const m of mediaFiles) {
    await addDoc(collection(db, 'events', eventId, 'media'), {
      ...m,
      eventId,
      uploadedBy: userUid || 'seed-admin',
      uploadedAt: serverTimestamp(),
    })
  }
  log('Media files seeded (20)')

  // ─── Notifications (for logged-in user) ──────────────────────────────────
  if (userUid) {
    const batch = writeBatch(db)
    const notifs = [
      { title: 'ISRO Scientist Dr. Jayakumar Arrived',       message: 'Dr. Jayakumar M. (ISRO) has checked in at Hotel Saravana Palace, Tiruchengode. Pickup completed by Murugan S.',                 type: 'guest',        read: false, link: `/guests?eventId=${eventId}` },
      { title: 'Budget Approvals Pending',                   message: 'Programme Booklets (₹20k), Certificate Printing (₹13.5k) and Guest Reimbursements (₹60k) are pending approval.',                type: 'budget',       read: false, link: `/budget?eventId=${eventId}` },
      { title: '3 Checklist Items Due Today',                message: 'IoT Workshop Lab Setup, Award Certificate printing & Prize cash envelopes must be completed by EOD April 16.',                   type: 'checklist',    read: false, link: `/checklists?eventId=${eventId}` },
      { title: 'ISRO Address LIVE – KSR Auditorium',         message: 'Dr. Jayakumar M.\'s "Space Technology & ISRO Missions" is LIVE now. 1,400+ attendees in auditorium.',                           type: 'announcement', read: true,  link: `/schedule?eventId=${eventId}` },
      { title: 'NIT Trichy Prof Pickup Scheduled',           message: 'Dr. Thirumalai S. arriving at Tiruchengode Bus Stop at 07:30. Ertiga dispatched. Senthil P. – please confirm.',                  type: 'guest',        read: true,  link: `/guests?eventId=${eventId}` },
      { title: 'Best Paper Shortlist – Ready for Review',    message: '3 papers shortlisted: Brinda Devi (PSG), Arun Prabhu (VIT), Renuga Devi (Mepco). Dr. Senthilkumar P. to review by 17:00.',     type: 'task',         read: false, link: `/registrations?eventId=${eventId}` },
    ]
    notifs.forEach((n) => {
      batch.set(doc(collection(db, 'users', userUid, 'notifications')), {
        ...n, createdAt: serverTimestamp(),
      })
    })
    await batch.commit()
    log('Notifications seeded (6)')
  }

  log('=== TECHNOVA 2026 seed complete! ===')
  return { eventId, logs }
}
