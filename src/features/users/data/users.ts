import { faker } from '@faker-js/faker'
import { type User } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(67890)

export const users: User[] = Array.from({ length: 500 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    first_name: firstName,
    last_name: lastName,
    username: faker.internet
      .username({ firstName, lastName })
      .toLocaleLowerCase(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    avatar: faker.helpers.maybe(() => faker.image.avatar()) || null,
    role: faker.helpers.arrayElement(['ADMIN', 'USER'] as const),
    is_active: faker.datatype.boolean({ probability: 0.85 }),
    is_verified: faker.datatype.boolean({ probability: 0.7 }),
    organization_name: faker.company.name(),
    devices_count: faker.number.int({ min: 0, max: 20 }),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
  }
})
