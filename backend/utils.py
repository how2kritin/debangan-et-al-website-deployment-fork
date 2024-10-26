import pickle
from typing import Tuple, Dict, List
import datetime
import random

# scores for various concerns for each day
DateScores = Tuple[str, Dict[str, List[int]]]
itr = 0

def get_cur_date(change_itr: bool = False) -> str:
    global itr
    now = datetime.datetime.now()
    next_date = now + datetime.timedelta(days=itr)
    if change_itr:
        itr = itr + 1
    date_string = next_date.strftime("%Y-%m-%d")
    return date_string


def get_random_date_scores(date_string: str, sizes: List[int], labels: List[str]) -> DateScores:
    # Create the second field of the DateScores object (the dictionary)
    scores_dict: Dict[str, List[int]] = {
        label: [random.choice([0, 1]) for _ in range(size)]
        for label, size in zip(labels, sizes)
    }

    return (date_string, scores_dict)



def append_to_file(file_path: str, entries: List[DateScores]) -> None:
    with open(file_path, 'ab') as file:
        for entry in entries:
            pickle.dump(entry, file)


def replace_last_entry(file_path: str, new_entry: DateScores) -> None:
    entries = []
    
    with open(file_path, 'rb') as file:
        while True:
            try:
                entries.append(pickle.load(file))
            except EOFError:
                break
    
    if entries:
        entries[-1] = new_entry
        
        with open(file_path, 'wb') as file:
            for entry in entries:
                pickle.dump(entry, file)


def read_last_entries(file_path: str, count: int) -> List[DateScores]:
    entries = []
    
    with open(file_path, 'rb') as file:
        while True:
            try:
                entries.append(pickle.load(file))
            except EOFError:
                break
    
    entries = entries[-count:] if len(entries) >= count else entries
    return entries


def is_cur_date_in_file(file_path: str):
    try:
        last_day = read_last_entries(file_path, 1)[0]
        return last_day[0] == get_cur_date()
    except:
        return False


