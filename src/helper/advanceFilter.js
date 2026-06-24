import moment from 'moment';
import { Constants } from './constants';


/** 
 * @params filterUnit: today | previousday etc.
 */
export const getAdvanceFilterData = async (filterUnit) => {
  let today = moment();
  let fromDate;
  let toDate;


  switch (filterUnit) {
    case Constants.TODAY:
      fromDate = today.format('YYYY-MM-DD');
      toDate = today.format('YYYY-MM-DD');
      break;

    case Constants.YESTERDAY:
      fromDate = today.clone().subtract(1, 'day').format('YYYY-MM-DD');
      toDate = today.clone().subtract(1, 'day').format('YYYY-MM-DD');
      break;

    case Constants.LAST7DAY:
      fromDate = today.clone().subtract(7, 'days').format('YYYY-MM-DD');
      toDate = today.format('YYYY-MM-DD');
      break;

    case Constants.LAST30DAY:
      fromDate = today.clone().subtract(30, 'days').format('YYYY-MM-DD');
      toDate = today.format('YYYY-MM-DD');
      break;

    case Constants.LAST365DAY:
      fromDate = today.clone().subtract(365, 'days').format('YYYY-MM-DD');
      toDate = today.format('YYYY-MM-DD');
      break;

    case Constants.THISWEEK:
      fromDate = today.clone().startOf('isoWeek').format('YYYY-MM-DD');  // Monday
      toDate = today.clone().endOf('isoWeek').format('YYYY-MM-DD');      // Sunday
      break;

    case Constants.LASTWEEK:
      fromDate = today.clone().subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD');
      toDate = today.clone().subtract(1, 'week').endOf('isoWeek').format('YYYY-MM-DD');
      break;

    case Constants.THISMONTH:
      fromDate = today.clone().startOf('month').format('YYYY-MM-DD');
      toDate = today.clone().endOf('month').format('YYYY-MM-DD');
      break;

    case Constants.PREVMONTH:
      fromDate = today.clone().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      toDate = today.clone().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      break;

    case Constants.THISQUARTER:
      fromDate = today.clone().startOf('quarter').format('YYYY-MM-DD');
      toDate = today.clone().endOf('quarter').format('YYYY-MM-DD');
      break;

    case Constants.LASTQUARTER:
      fromDate = today.clone().subtract(1, 'quarter').startOf('quarter').format('YYYY-MM-DD');
      toDate = today.clone().subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD');
      break;

    case Constants.CURRENTFISCAL: {
      const fiscalStartMonth = 3; // April
      if (today.month() < fiscalStartMonth) {
        fromDate = today.clone().subtract(1, 'year').month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      } else {
        fromDate = today.clone().month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().add(1, 'year').month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      }
      break;
    }

    case Constants.LASTFISCAL: {
      const fiscalStartMonth = 3; // April
      if (today.month() < fiscalStartMonth) {
        fromDate = today.clone().subtract(2, 'year').month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().subtract(1, 'year').month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      } else {
        fromDate = today.clone().subtract(1, 'year').month(fiscalStartMonth).startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().month(fiscalStartMonth - 1).endOf('month').format('YYYY-MM-DD');
      }
      break;
    }

    default:
      console.warn('Invalid filterUnit:', filterUnit);
  }

  return { fromDate, toDate };
}