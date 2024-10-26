import random
import math
from typing import List, Dict

import utils

# TODO: ADD FOR OTHER CONCERNS
JSONFILE = "./scores.json"
DATE_SCORES_SIZES = [9]
DATE_SCORES_LABELS = ["Depression"]
CONCERN_REANGES = [4]


def add_scores(a: List[int], b: List[int]):
    return [max(a[i], b[i]) for i in range(len(a))] # hacky bitwise or


def get_cur_day_scores():
    def accumulate_scores(scores_list: List[utils.DateScores]) -> utils.DateScores:
        aggregate: utils.DateScores = (scores_list[-1], scores_list[-1])
        for date_score in scores_list[:-1]:
            for key in aggregate[1]:
                aggregate[1][key] = add_scores(aggregate[1][key], date_score[1][key])

        return aggregate

    last_week: List[utils.DateScores] = utils.read_last_entries(JSONFILE, 7)
    return accumulate_scores(last_week)


def update_cur_day_scores(scores_to_add: utils.DateScores) -> utils.DateScores:
    # only call if current date is stored in file, else append
    cur_day_scores = get_cur_day_scores()

    for key in cur_day_scores[1]:
        cur_day_scores[1][key] = add_scores(cur_day_scores[1][key], scores_to_add[1][key])
    
    utils.replace_last_entry(JSONFILE, cur_day_scores)
    return cur_day_scores


def calculate_phq_scores(week_scores: List[utils.DateScores], concern_ranges: List[int]):
    num_cols = {concern: len(week_scores[0][1][concern]) for concern in week_scores[0][1]}
    scores = {key: [0 for _ in range(num_cols[concern])] for key in num_cols}

    for day in range(7):
        for concern in num_cols:
            for col in range(num_cols[concern]):
                scores[concern][col] += week_scores[day][concern][col]
    
    # changing score from list to int
    i = 0
    concern_score: Dict[str, int] = {key: 0 for key in num_cols}
    for concern in scores:
        for col in range(num_cols([concern])):
            concern_score[concern] += math.floor(scores[concern][col] * concern_ranges[i] / 7.1)
        i += 1
    
    return concern_score


def get_cur_day_phq_scores(input_text: str):
    # TODO: arg unused for now
    
    cur_date = utils.get_cur_date()
    # TODO: plug in model outputs here when done
    change_in_state = utils.get_random_date_scores(cur_date, DATE_SCORES_SIZES, DATE_SCORES_LABELS)
    todays_scores: utils.DateScores = (cur_date, change_in_state)

    # update cur date in file
    if utils.is_cur_date_in_file(JSONFILE):
        todays_scores = update_cur_day_scores(todays_scores)
    else:
        utils.append_to_file(JSONFILE, [todays_scores])
    
    return calculate_phq_scores(utils.read_last_entries(7), CONCERN_REANGES)


def get_cur_day_concern_labels(scores: Dict[str, int]):
    # TODO: write actual shite
    return {key: key for key in scores}
    


def process_data(input_text: str):
    polarity = random.choice(["positive", "neutral", "negative"])
    features = f"Features of {input_text}"
    concerns = f"Concerns about {input_text}"
    score = round(random.uniform(0, 10), 2)

    cur_day_phq_scores = get_cur_day_phq_scores(input_text)
    cur_day_concern_labels = get_cur_day_concern_labels(cur_day_phq_scores)

    return {
        "polarity": polarity,
        "features": features,
        "concerns": concerns,
        "score": score,
        "concernScores": cur_day_phq_scores,
        "concernLabels": cur_day_concern_labels
    }
