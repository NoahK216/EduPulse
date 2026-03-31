import type { PublicClassroomMember } from '../../../types/publicApi';

type ClassroomMemberCardProps = {
  member: PublicClassroomMember;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ClassroomMemberCard({ member }: ClassroomMemberCardProps) {
  return (
    <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
      <h2 className="text-xl font-semibold">{member.user_name}</h2>
      <p className="mt-1 text-sm text-neutral-300">{member.user_email}</p>
      <p className="mt-1 text-sm text-neutral-300">Role: {member.role}</p>
      <p className="mt-1 text-sm text-neutral-300">
        Classroom: {member.classroom_name}
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        Joined: {formatDate(member.created_at)}
      </p>
    </section>
  );
}

export default ClassroomMemberCard;
