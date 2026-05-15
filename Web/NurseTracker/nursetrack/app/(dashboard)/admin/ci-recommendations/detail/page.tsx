import { CiRecommendationsDetailContent } from "@/components/features/CiRecommendationsDetailContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <CiRecommendationsDetailContent basePath="/admin" searchParams={props.searchParams} />;
}
