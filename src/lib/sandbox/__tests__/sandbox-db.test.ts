import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { addJournalEntries, deleteSandboxDatabase, getJournal } from '../sandbox-db';

const usedSids: string[] = [];

function sid(label: string): string {
  const value = `vitest-${label}-${crypto.randomUUID()}`;
  usedSids.push(value);
  return value;
}

afterEach(async () => {
  await Promise.all(usedSids.splice(0).map((value) => deleteSandboxDatabase(value)));
});

describe('addJournalEntries', () => {
  it('writes related records as one batch', async () => {
    const testSid = sid('batch');
    await addJournalEntries(testSid, [
      { operation: 'create', resource: 'students', recordId: 'student-1', payload: { id: 'student-1' } },
      { operation: 'create', resource: 'achievements', recordId: 'achievement-1', payload: { id: 'achievement-1', student_id: 'student-1' } },
    ]);
    expect((await getJournal(testSid)).map((entry) => entry.recordId)).toEqual(['student-1', 'achievement-1']);
  });

  it('aborts the transaction when one payload cannot be cloned', async () => {
    const testSid = sid('rollback');
    await expect(addJournalEntries(testSid, [
      { operation: 'create', resource: 'students', recordId: 'student-1', payload: { id: 'student-1' } },
      { operation: 'create', resource: 'achievements', recordId: 'invalid', payload: { invalid: () => undefined } },
    ])).rejects.toBeDefined();
    expect(await getJournal(testSid)).toEqual([]);
  });
});
