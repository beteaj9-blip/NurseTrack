import { OvertimeDetailsDetailContent } from "@/components/features/OvertimeDetailsDetailContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <OvertimeDetailsDetailContent basePath="/coordinator" searchParams={props.searchParams} />;
}
