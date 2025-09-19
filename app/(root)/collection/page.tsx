import QuestionCard from "@/components/cards/QuestionCard";
import LocalSearch from "@/components/search/LocalSearch";
import DataRenderer from "@/components/DataRenderer";
import {EMPTY_QUESTION} from "@/constants/states";
import {getSavedQuestions} from "@/lib/actions/collection.action";
import ROUTES from "@/constants/routes";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Collections = async ({searchParams}: SearchParams) => {
  const {page, pageSize, query, filter} = await searchParams;

  const {success, data, error} = await getSavedQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 15,
    query: query || "",
    filter: filter || "",
  });

  const {collection} = data || {};
  console.log("collection", collection);

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search question..."
          otherClasses="flex-1"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={collection}
        empty={EMPTY_QUESTION}
        render={(collection) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {collection.map((item) => (

              <QuestionCard key={item._id} question={item.question}/>
            ))}
          </div>
        )}
      />
    </>
  );
};

export default Collections;
