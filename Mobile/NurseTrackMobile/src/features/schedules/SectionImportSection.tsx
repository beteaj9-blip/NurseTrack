import React from 'react';
import { SectionProps } from '../shared/types';
import { ImportSection } from '../shared/components';

export function SectionImportSection({ token, setMessage, refresh }: SectionProps) {
  return <ImportSection title="Section Import" badge="Section Import" previewPath="/users/section-import/preview" publishPath="/users/section-import/publish" token={token} setMessage={setMessage} refresh={refresh} />;
}
