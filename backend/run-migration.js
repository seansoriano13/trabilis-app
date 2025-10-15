#!/usr/bin/env node

import updateVisaInquiryReferences from './migrations/update-visa-inquiry-references.js'

console.log('Running visa inquiry reference migration...')
await updateVisaInquiryReferences()
console.log('Migration completed!')
