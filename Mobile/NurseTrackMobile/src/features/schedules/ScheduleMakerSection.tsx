import React from 'react';
import { SectionProps } from '../shared/types';
import { ImportSection } from '../shared/components';

export function ScheduleMakerSection({ token, setMessage, refresh }: SectionProps) {
  return <ImportSection title="Schedule Maker" badge="Schedule Import" previewPath="/schedules/import/preview" publishPath="/schedules/import/publish" token={token} setMessage={setMessage} refresh={refresh} />;
}
