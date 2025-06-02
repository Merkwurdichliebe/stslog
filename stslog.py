import sys
import json

def readfile(filename) -> dict:
    with open(filename, "r") as file:
        data = json.load(file)
    return data

def get_floor_type(type) -> str:
    match type:
        case 'M':
            return 'Monster'
        case 'E':
            return 'Elite'
        case '?':
            return 'Event'
        case 'R':
            return 'Campfire'
        case '$':
            return 'Shop'
        case 'T':
            return 'Chest'
        case 'BOSS':
            return 'Boss'

def parse_args() -> str:
    args = sys.argv
    if len(args) != 2:
        print(f'Usage: stsrun.py [filename]')
        print(f'-- Pass in a Slay the Spire run file with .run extension')
        sys.exit()
    else:
        return sys.argv[1]

def run(filename):
    run = readfile(filename) # '1748809706.run'

    floor_count = len(run["path_taken"])
    act = 1

    for floor in range(floor_count):
        type = run["path_taken"][floor]
        # event_type = run["path_per_floor"][floor]

        # ENEMIE
        enemies = [item for item in run["damage_taken"] if item.get('floor') == floor+act]
        damage_taken = 0

        # EVENT
        event = [item for item in run["event_choices"] if item.get('floor') == floor+act]

        # CAMPFIRE
        campfire = [item for item in run["campfire_choices"] if item.get('floor') == floor+act]

        # PURCHASE
        purchase_indices = [i for i, value in enumerate(run['item_purchase_floors']) if value == floor+act]

        type_description = ''
        if enemies:
            type_description = f'({enemies[0]['enemies']}, {enemies[0]['turns']} turns, {enemies[0]['damage']} HP)'
        
        if event:
            type_description = f'({(event[0]['event_name'])}: {(event[0]['player_choice'])})'
        
        if campfire:
            key = campfire[0]['key']
            match key:
                case 'REST':
                    type_description = f'(rest)'
                case 'SMITH':
                    type_description = f'(smith {campfire[0]['data']}+)'


        # FLOOR STATS
        print(f'\n### Floor {floor+1} HP {run["current_hp_per_floor"][floor]}/{run["max_hp_per_floor"][floor]} Gold {run["gold_per_floor"][floor]}')
        print(f'{get_floor_type(type)} {type_description}')
        # print(f'HP: {run["current_hp_per_floor"][floor]}/{run["max_hp_per_floor"][floor]} Gold: {run["gold_per_floor"][floor]}')

        # CARD PICKS
        picked = [item['picked'] for item in run["card_choices"] if item.get('floor') == floor+act]
        not_picked = [item['not_picked'] for item in run["card_choices"] if item.get('floor') == floor+act]

        if picked:
            if picked[0] != 'SKIP':
                print(f'- Add: {picked[0]} ({", ".join(not_picked[0])})')
            else:
                print(f'- Skip ({", ".join(not_picked[0])})')

        if purchase_indices:
            items = [run['items_purchased'][index] for index in purchase_indices]
            print(f'- Purchased: {', '.join(items)}')

        # BOSS SEPARATOR
        if type == 'BOSS':
            if run['boss_relics'][act-1]['picked']:
                print(f'- Relic: {run['boss_relics'][act-1]['picked']} ({', '.join(run['boss_relics'][act-1]['not_picked'])})')
            else:
                print(f'- Relic skipped ({', '.join(run['boss_relics'][act-1]['not_picked'])})')
            act += 1
            print(f'\n# Act {act}')

if __name__ == '__main__':
    file = parse_args()
    run(file)