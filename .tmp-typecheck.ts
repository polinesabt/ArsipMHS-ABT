interface Achievement {
  id: string;
  student_id: string;
  category: string;
  title: string;
}

const data: Achievement = { id: '1', student_id: 's', category: 'c', title: 't' };
const x = (data as Record<string, unknown>).id;
