import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  
  // Create Config Version 3
  const config = await prisma.configVersion.create({
    data: {
      version: 3,
      businessName: 'Northline Roofing & Exteriors',
      region: 'Columbus, OH',
      currency: 'USD',
      wasteFactor: 0.10,
      permitFlatFee: 350,
      rangeSpreadPct: 12,
      isActive: true,
      questions: {
        create: [
          {
            key: 'roof_area',
            label: 'Roughly how big is your roof?',
            type: 'number',
            unit: 'sq ft',
            required: true,
            min: 300,
            max: 12000,
            active: true,
            order: 1
          },
          {
            key: 'material',
            label: 'What material do you want?',
            type: 'select',
            required: true,
            active: true,
            order: 2,
            options: {
              create: [
                { value: 'asphalt_3tab', label: 'Asphalt shingle - 3-tab', ratePerSqft: 4.25 },
                { value: 'asphalt_arch', label: 'Asphalt shingle - architectural', ratePerSqft: 5.90 },
                { value: 'metal_standing', label: 'Standing seam metal', ratePerSqft: 12.40 },
                { value: 'cedar_shake', label: 'Cedar shake', ratePerSqft: 11.10 },
              ]
            }
          },
          {
            key: 'pitch',
            label: 'How steep is the roof?',
            type: 'select',
            required: true,
            active: true,
            order: 3,
            options: {
              create: [
                { value: 'low', label: 'Low - you could walk on it', multiplier: 1.0 },
                { value: 'medium', label: 'Medium', multiplier: 1.12 },
                { value: 'steep', label: 'Steep - not walkable', multiplier: 1.30 },
              ]
            }
          },
          {
            key: 'layers',
            label: 'How many layers of old roofing are on there now?',
            type: 'select',
            required: true,
            active: true,
            order: 4,
            options: {
              create: [
                { value: '0', label: 'None - new build', tearOffPerSqft: 0 },
                { value: '1', label: 'One layer', tearOffPerSqft: 1.15 },
                { value: '2', label: 'Two or more layers', tearOffPerSqft: 2.05 },
              ]
            }
          },
          {
            key: 'stories',
            label: 'How many stories is the house?',
            type: 'select',
            required: true,
            active: true,
            order: 5,
            options: {
              create: [
                { value: '1', label: 'Single storey', multiplier: 1.0 },
                { value: '2', label: 'Two storeys', multiplier: 1.08 },
                { value: '3', label: 'Three or more', multiplier: 1.18 },
              ]
            }
          }
        ]
      }
    }
  });

  // Create legacy config Version 1 for historical leads to reference
  const legacyConfig = await prisma.configVersion.create({
    data: {
      version: 1,
      businessName: 'Northline Roofing & Exteriors',
      region: 'Columbus, OH',
      currency: 'USD',
      wasteFactor: 0.10,
      permitFlatFee: 200,
      rangeSpreadPct: 15,
      isActive: false,
    }
  });

  // Seed Historical Leads
  await prisma.lead.create({
    data: {
      id: 'ld_1041',
      configVersionId: config.id,
      name: 'Ana Ruiz',
      phone: '+1-614-555-0148',
      email: 'aruiz@example.com',
      answers: JSON.stringify({
        roof_area: 2100,
        material: 'asphalt_arch',
        pitch: 'medium',
        layers: '1',
        stories: '2'
      }),
      estimateLow: 21480,
      estimateHigh: 27260,
      capturedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.lead.create({
    data: {
      id: 'ld_0917',
      configVersionId: legacyConfig.id,
      name: 'Bill Tanner',
      phone: '+1-614-555-0192',
      email: 'btanner@example.com',
      answers: JSON.stringify({
        roof_area: 1450,
        material: 'slate_natural',
        pitch: 'steep',
        chimney_count: 2,
        gutter_replace: 'yes'
      }),
      estimateLow: 38900,
      estimateHigh: 44100,
      capturedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.lead.create({
    data: {
      id: 'ld_1102',
      configVersionId: config.id,
      name: 'Priya Nair',
      phone: '+1-614-555-0177',
      email: 'pnair@example.com',
      answers: JSON.stringify({
        roof_area: 900,
        material: 'metal_standing',
        pitch: 'low',
        layers: '0',
        stories: '1'
      }),
      estimateLow: 12240,
      estimateHigh: 15530,
      capturedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
