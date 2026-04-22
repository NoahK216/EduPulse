# EduPulse Future Work

## Instructor Assignment Interaction 
- Currently, an assigned scenario is completed, and the responses stored. No grade is immediately assigned and there is no way to grade on platform. This could be changed.
- Inform instructors of unviewed attempt submissions on the dashboard and classroom page
- Allow Instructors to modify assignments, using an assignment_version model. Similar to scenarios and scenario_versions

## Scenario storing
Currently in our DB, scenarios are stored as opaque JSON objects. This means that for any part of one to be retrieved, the entire scenario must be fetched. This is undesirable.

## Multi-Layered Caching
Performance might be meaningfully improved by implementing a server cache
- Redis free plan might be appropriate

## Carmen-Messages style announcements/notifications
- Self-explanatory

## Student Classroom Flow
- The join classroom flow should include a route where students browse to something like edupulse.net/join/<join code>

## Time zones are ever tricky, our current implementation doesn't take them into account, it probably should!

## Classroom stability
- Ensure a classroom always has at least one instructor
- Allow instructors to delete classrooms

## Account interaction
- Password recovery
- 
