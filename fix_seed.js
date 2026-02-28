const fs = require('fs');

let content = fs.readFileSync('prisma/seed.ts', 'utf-8');

// Find all the old variable assignments that are used in createMany below
const varsRegex = /const (phq9|sdq|emotionMasks|patternWeaving|storySeeds|breathBell|phqa|uncertaintyCompass|socialHarmony|rhythmMeter|ethicsMotion|asrs|gds15|gad7|audit|debateEvidence|cognitiveMarketplace|temperamentBalance|valuesCompass|processingKindMode|wisdomAmbiguity|gentleAttention|lifeChapters) = await prisma\.instrument\.create\(\{/g;

// Instead of rewriting the assignment array completely, we can fetch all instruments dynamically

const newAssignmentBlock = `
  const allInstruments = await prisma.instrument.findMany();
  const getInst = (slug) => allInstruments.find(i => i.slug === slug);

  await prisma.instrumentAssignment.createMany({
    data: [
      {
        patientId: childPatient.id,
        instrumentId: getInst("sdq").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatusconst fs = require('fs');et
let content = fs.readFi) -
// Find all the old variable assignments that are usetientconst varsRegex = /const (phq9|sdq|emotionMasks|patternWeaving|storySeeds.i
// Instead of rewriting the assignment array completely, we can fetch all instruments dynamically

const newAssignmentBlock = `
  const allInstruments = await prisma.instrument.findMany();
  const getInst = (slug) => allInstruments.find(i => i.slug === slug);

  await prisma.instrumentAssignment.createMany({
    data: [
      {
        patieent
const newAssignmentBlock = `
  const allInstruments = await prisma.instrument.findMany();
  con     const allInstruments = awme  const getInst = (slug) => allInstruments.find(i => i.sluges
  await prisma.instrumentAssignment.createMany({
    data: [
      {id,    data: [
      {
        patientId: childPat        {
  st      As        instrumentId: getInst("sdq          assignedByUserId: adminUser.id,d,        status: InstrumentAssignmentSt.ilet content = fs.readFi) -
// Find all the old variable assignments tA// Find all the old varia,
// Instead of rewriting the assignment array completely, we can fetch all instruments dynamically

const newAssignmentBlock = `
  cost
const newAssignmentBlock = `
  const allInstruments = await prisma.instrument.findMany();
  conAss  const allInstruments = aw    const getInst = (slug) => allInstruments.find(i => i.slugtr
  await prisma.instrumentAssignment.createMany({
    data: [
      {
      data: [
      {
        patieent
const newAED      {
  
       
 const newAssignd:  const allInstruments = awns  con     const allInstruments = awme  const getInst = (sluig  await prisma.instrumentAssignment.createMany({
    data: [
      {id,    data: [
      {
            data: [
      {id,    data: [
      {
     in      {id,:       {
        pati
        a  st      As        instrumentId: g  // Find all the old variable assignments tA// Find all the old varia,
// Instead of rewriting the assignment array completely, we can fetch all instrumentgu// Instead of rewriting the assignment array completely, we can fetcst
const newAssignmentBlock = `
  cost
const newAssignmentBlock = `
  const allInstruments = await     cost
const newAssignmentBorconst-c  const allInstruments = awne  conAss  const allInstruments = aw    const getInst = (slunt  await prisma.instrumentAssignment.createMany({
    data: [
      {
      data: [
      {
      rt    data: [
      {
      data: [
      {
     a.      {
  As      nt      {
    {'      nsconst newAED   in  
       
 const l. nc const'c    data: [
      {id,    data: [
      {
            data: [
      {id,    data: [
      {
     in      {id,:       {
        pati
        a  st      As  an      {id,        {
            
       li      {id,    datat)      {
     in     fs     iFi        pati
        a  sfi        a  ;
// Instead of rewriting the assignment array completely, we can fetch all instrumentgu// Instead of rewriting the k'const newAssignmentBlock = `
  cost
