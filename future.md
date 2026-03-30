# EduPulse Future Work

## Scenario grading
Currently, an assigned scenario is completed, and the responses stored. No grade is immediately assigned and there is no way to grade on platform. This could be changed.

## Scenario storing
Currently in our DB, scenarios are stored as opaque JSON objects. This means that for any part of one to be retrieved, the entire scenario must be fetched. This is undesirable.

## Multi-Layered Caching
Performance could be meaningfully improved by implementing a cache for clients and the server
- Client: TanStack Query
- Server: Redis free plan might be appropriate

## Carmen-Messages style notifications

## Allow Instructors to modify assignments, using an assignment_version model. Similar to scenarios and scenario_versions

The join classroom flow should include a route where students browse to something like edupulse.net/join/<join code>