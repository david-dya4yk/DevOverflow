import { EMPTY_ANSWERS } from '@/constants/states';
import DataRenderer from '../DataRenderer';
import AnswerCard from '../cards/AnswerCard';
import CommonFilter from '@/components/filters/CommonFilter';
import { AnswerFilters } from '@/constants/filters';
import Pagination from '@/components/Pagination';

interface Props extends ActionResponse<Answers[]> {
  page: number;
  isNext: boolean;
  totalAnswers: number;
}

const AllAnswers = ({
  data,
  success,
  error,
  totalAnswers,
  page,
  isNext,
}: Props) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers === 1
            ? `${totalAnswers} Answer`
            : `${totalAnswers} Answers`}
        </h3>
        <CommonFilter
          filters={AnswerFilters}
          otherClasses="sm:min-w-32"
          containerClasses="max-xs:w-full"
        />
      </div>
      <DataRenderer
        data={data}
        success={success}
        error={error}
        empty={EMPTY_ANSWERS}
        render={answers =>
          answers.map(answer => <AnswerCard key={answer._id} {...answer} />)
        }
      />

      <Pagination page={page} isNext={isNext} />
    </div>
  );
};

export default AllAnswers;
