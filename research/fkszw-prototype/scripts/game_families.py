# -*- coding: utf-8 -*-
"""1-20 关全部 160 家族的英文命名 + 8 大类归类。
大类对齐原版风格（每关 5-8 个主题大类），跨关复用同一张表。
fam -> (英文名, 大类)"""

FAMS = {
    # Electronics 电子电器
    '18': ('Phone', 'Electronics'), '15': ('PC Parts', 'Electronics'), '204': ('Power Strip', 'Electronics'),
    '256': ('Laptop', 'Electronics'), '72': ('Game Console', 'Electronics'), '218': ('Remote', 'Electronics'),
    '56': ('Calculator', 'Electronics'), '702': ('Phone Case', 'Electronics'), '705': ('Cable', 'Electronics'),
    '706': ('Smartwatch', 'Electronics'), '701': ('Earbuds', 'Electronics'), '700': ('Drone', 'Electronics'),
    '219': ('Disc', 'Electronics'), '704': ('Camera', 'Electronics'), '102': ('Electronics', 'Electronics'),
    '77': ('Radio', 'Electronics'), '61': ('Printer', 'Electronics'), '57': ('Telephone', 'Electronics'),
    '233': ('Battery', 'Electronics'), '300': ('Flashlight', 'Electronics'), '217': ('Microphone', 'Electronics'),
    '68': ('Hair Dryer', 'Electronics'), '203': ('Desk Lamp', 'Electronics'), '66': ('Hair Clipper', 'Electronics'),
    # Clothing 衣物穿戴
    '24': ('Top', 'Clothing'), '1': ('Pants', 'Clothing'), '23': ('Skirt', 'Clothing'),
    '19': ('Tableware', 'Food & Kitchen'), '40': ('Condiments', 'Food & Kitchen'), '37': ('Frying Pan', 'Food & Kitchen'),
    '38': ('Rice Cooker', 'Food & Kitchen'), '41': ('Soup Pot', 'Food & Kitchen'), '86': ('Pour-over Kettle', 'Food & Kitchen'),
    '81': ('Coffee Beans', 'Food & Kitchen'), '83': ('Coffee Cup', 'Food & Kitchen'), '87': ('Milk Tea', 'Food & Kitchen'),
    '76': ('Soda', 'Food & Kitchen'), '75': ('Water Bottle', 'Food & Kitchen'), '82': ('Milk', 'Food & Kitchen'),
    '27': ('Cup', 'Food & Kitchen'), '215': ('Wine Glass', 'Food & Kitchen'), '506': ('Cooking Oil', 'Food & Kitchen'),
    '323': ('Staple Food', 'Food & Kitchen'), '325': ('Eggs', 'Food & Kitchen'), '322': ('Cooked Dish', 'Food & Kitchen'),
    '272': ('Instant Noodles', 'Food & Kitchen'), '8': ('Beer Bottle', 'Food & Kitchen'), '39': ('Thermos', 'Food & Kitchen'),
    '5': ('Can', 'Food & Kitchen'), '46': ('Fruit', 'Food & Kitchen'), '45': ('Vegetables', 'Food & Kitchen'),
    '4': ('Snack Bag', 'Food & Kitchen'), '207': ('Chips', 'Food & Kitchen'), '205': ('Popcorn', 'Food & Kitchen'),
    '279': ('Spicy Strips', 'Food & Kitchen'), '100': ('Snacks', 'Food & Kitchen'), '96': ('Sandwich', 'Food & Kitchen'),
    '276': ('Lollipop', 'Food & Kitchen'), '7': ('Fruit Peel', 'Food & Kitchen'),
    # Clothing 衣物穿戴
    '24': ('Top', 'Clothing'), '1': ('Pants', 'Clothing'), '23': ('Skirt', 'Clothing'),
    '111': ('Socks', 'Clothing'), '11': ('Hat', 'Clothing'), '16': ('Shoes', 'Clothing'),
    '347': ('Scarf', 'Clothing'), '42': ('Apron', 'Clothing'), '43': ('Gloves', 'Clothing'),
    '26': ('Glasses', 'Clothing'), '232': ('Bracelet', 'Clothing'), '337': ('Wallet', 'Clothing'),
    '231': ('Necklace', 'Clothing'), '201': ('Hair Clip', 'Clothing'), '202': ('Umbrella', 'Clothing'),
    '303': ('Mask', 'Clothing'), '50': ('Backpack', 'Clothing'), '62': ('Canvas Bag', 'Clothing'),
    '85': ('Paper Bag', 'Clothing'), '28': ('Handbag', 'Clothing'), '103': ('Clothing', 'Clothing'),
    '12': ('Towel', 'Clothing'), '74': ('Long Towel', 'Clothing'), '84': ('Dish Cloth', 'Clothing'),
    # Household 家居日用
    '6': ('Waste Paper', 'Household'), '33': ('Tissue', 'Household'), '59': ('Paper Cup', 'Household'),
    '47': ('Cardboard Box', 'Household'), '200': ('Cushion', 'Household'), '209': ('Ashtray', 'Household'),
    '222': ('Pill Bottle', 'Household'), '51': ('Broom', 'Household'), '71': ('Mop', 'Household'),
    '36': ('Basin', 'Household'), '79': ('Tray', 'Household'), '346': ('Storage Basket', 'Household'),
    '277': ('Plastic Bag', 'Household'), '301': ('Parcel', 'Household'), '330': ('Newspaper', 'Household'),
    '208': ('Poster', 'Household'), '237': ('Movie Ticket', 'Household'), '213': ('Lighter', 'Household'),
    '212': ('Cigarettes', 'Household'), '306': ('Christmas Tree', 'Household'), '305': ('Porcelain', 'Household'),
    '302': ('Car Key', 'Household'), '21': ('Keys', 'Household'), '30': ('Hanger', 'Household'),
    '608': ('Bucket', 'Household'), '70': ('Squeegee', 'Household'),
    # Stationery & Office 文具办公
    '53': ('Notebook', 'Stationery & Office'), '54': ('Stationery', 'Stationery & Office'),
    '55': ('File Folder', 'Stationery & Office'), '13': ('Pen', 'Stationery & Office'),
    '60': ('Stapler', 'Stationery & Office'), '511': ('Pencil Sharpener', 'Stationery & Office'),
    '513': ('Correction Tools', 'Stationery & Office'), '104': ('Stationery Set', 'Stationery & Office'),
    '17': ('Books', 'Stationery & Office'), '52': ('Textbook', 'Stationery & Office'),
    '101': ('Books', 'Stationery & Office'), '324': ('Price Tag', 'Stationery & Office'),
    '508': ('Receipt', 'Stationery & Office'), '514': ('Washi Tape', 'Stationery & Office'),
    '333': ('Safety Pin', 'Stationery & Office'),
    # Tools & Auto 工具汽修
    '48': ('Tools', 'Tools & Auto'), '44': ('Knives', 'Tools & Auto'), '67': ('Hair Scissors', 'Tools & Auto'),
    '332': ('Utility Knife', 'Tools & Auto'), '221': ('Grip Trainer', 'Tools & Auto'),
    '360': ('Tire', 'Tools & Auto'), '357': ('Hubcap', 'Tools & Auto'), '361': ('Shock Absorber', 'Tools & Auto'),
    '363': ('Goggles', 'Tools & Auto'), '364': ('Car Window', 'Tools & Auto'), '358': ('Engine', 'Tools & Auto'),
    '359': ('Car Hood', 'Tools & Auto'), '362': ('Wiper', 'Tools & Auto'),
    # Toys & Leisure 玩具娱乐
    '3': ('Plush Toy', 'Toys & Leisure'), '501': ('Rubik\'s Cube', 'Toys & Leisure'),
    '2': ('Toy Vehicle', 'Toys & Leisure'), '210': ('Mahjong', 'Toys & Leisure'),
    '211': ('Playing Cards', 'Toys & Leisure'), '9': ('Sports Gear', 'Toys & Leisure'),
    '313': ('Gift Box', 'Toys & Leisure'),
    # Care & Medical 个护医药
    '25': ('Cosmetics', 'Care & Medical'), '29': ('Comb', 'Care & Medical'), '64': ('Shampoo', 'Care & Medical'),
    '63': ('Hair Cream', 'Care & Medical'), '65': ('Wig', 'Care & Medical'),
    '320': ('IV Bag', 'Care & Medical'), '319': ('Cotton Swab', 'Care & Medical'), '316': ('Medicine', 'Care & Medical'),
    '709': ('Medicine Box', 'Care & Medical'), '710': ('Prescription', 'Care & Medical'),
    '712': ('Prescription Pad', 'Care & Medical'), '708': ('Medicine Bag', 'Care & Medical'),
    '711': ('Sanitizer', 'Care & Medical'), '707': ('Thermometer', 'Care & Medical'),
    '517': ('Nurse Cap', 'Care & Medical'), '607': ('Paint', 'Care & Medical'), '609': ('Palette', 'Care & Medical'),
    '314': ('IV Tube', 'Care & Medical'), '78': ('Napkin', 'Household'),
    '87b': None,
}
# 607/609 颜料/调色盘归 Care&Medical 不合适 -> 归 Toys & Leisure（美术用品）
FAMS['607'] = ('Paint', 'Toys & Leisure')
FAMS['609'] = ('Palette', 'Toys & Leisure')
FAMS.pop('87b', None)

def en_name(f):
    return FAMS.get(f, (f'Misc {f}', 'Household'))[0]

def cat(f):
    return FAMS.get(f, (None, 'Household'))[1]
