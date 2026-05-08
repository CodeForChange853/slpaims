-- ─────────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO categories (name, description) VALUES
('Grains & Cereals',  'Rice, corn, oats and other grain products'),
('Canned Goods',      'Canned sardines, tuna, corned beef, and similar'),
('Beverages',         'Coffee, juice, softdrinks, and powdered drinks'),
('Condiments',        'Soy sauce, vinegar, cooking oil, and seasonings'),
('Snacks & Sweets',   'Biscuits, candies, chips, and confectionery');

-- ─────────────────────────────────────────────
-- 2. PRODUCTS  (category_id resolved by name)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO products (name, description, price, quantity, threshold, category_id) VALUES
('Premium White Rice 50kg',  'Well-milled premium white rice',         2200.00,  85, 20, (SELECT id FROM categories WHERE name = 'Grains & Cereals')),
('Corn Grits 1kg',           'Fine corn grits for porridge and snacks',  38.50, 140, 30, (SELECT id FROM categories WHERE name = 'Grains & Cereals')),
('Rolled Oats 500g',         'Instant rolled oats',                      75.00,  60, 15, (SELECT id FROM categories WHERE name = 'Grains & Cereals')),
('Sardines in Tomato Sauce', 'Mega Sardines 155g',                       18.00, 320, 50, (SELECT id FROM categories WHERE name = 'Canned Goods')),
('Corned Beef 150g',         'Argentina corned beef',                    52.00, 180, 40, (SELECT id FROM categories WHERE name = 'Canned Goods')),
('Tuna Flakes in Oil 180g',  'Century tuna in oil',                      42.00, 210, 40, (SELECT id FROM categories WHERE name = 'Canned Goods')),
('3-in-1 Coffee Sachet',     'Nescafe classic 3-in-1 box of 10',         55.00, 150, 30, (SELECT id FROM categories WHERE name = 'Beverages')),
('Orange Juice 1L',          'Tropicana 100% orange juice',              89.00,  45, 15, (SELECT id FROM categories WHERE name = 'Beverages')),
('Powdered Chocolate Drink', 'Milo 300g pouch',                         115.00,  90, 20, (SELECT id FROM categories WHERE name = 'Beverages')),
('Soy Sauce 1L',             'Silver Swan soy sauce',                    52.00, 110, 25, (SELECT id FROM categories WHERE name = 'Condiments')),
('Cooking Oil 1L',           'Baguio Gold palm oil',                     95.00,  75, 20, (SELECT id FROM categories WHERE name = 'Condiments')),
('Vinegar 750ml',            'Datu Puti cane vinegar',                   35.00, 130, 25, (SELECT id FROM categories WHERE name = 'Condiments')),
('Sky Flakes Crackers 250g', 'Malkist crackers pack',                    38.00, 200, 40, (SELECT id FROM categories WHERE name = 'Snacks & Sweets')),
('Nova Country Chips 100g',  'Nova multigrain snacks',                   28.00, 175, 35, (SELECT id FROM categories WHERE name = 'Snacks & Sweets')),
('Flat Tops Chocolate 100g', 'Flat Tops milk chocolate',                 42.00,  95, 20, (SELECT id FROM categories WHERE name = 'Snacks & Sweets'));

-- ─────────────────────────────────────────────
-- 3. TRANSACTIONS  (product_id resolved by name)
-- ─────────────────────────────────────────────

-- Stock IN
INSERT INTO transactions (product_id, type, quantity, stock_after, note, created_by, created_at) VALUES
((SELECT id FROM products WHERE name = 'Premium White Rice 50kg'),  'in', 100, 185, 'Initial delivery from NFA warehouse',       1, datetime('now', '-30 days')),
((SELECT id FROM products WHERE name = 'Corn Grits 1kg'),           'in', 200, 340, 'Supplier delivery - corn grits restock',    1, datetime('now', '-28 days')),
((SELECT id FROM products WHERE name = 'Sardines in Tomato Sauce'), 'in', 500, 820, 'Bulk order: sardines',                      1, datetime('now', '-27 days')),
((SELECT id FROM products WHERE name = 'Corned Beef 150g'),         'in', 250, 430, 'Corned beef restock from distributor',      1, datetime('now', '-25 days')),
((SELECT id FROM products WHERE name = '3-in-1 Coffee Sachet'),     'in', 200, 350, 'Coffee sachet restock',                     1, datetime('now', '-23 days')),
((SELECT id FROM products WHERE name = 'Soy Sauce 1L'),             'in', 150, 260, 'Soy sauce delivery',                        1, datetime('now', '-20 days')),
((SELECT id FROM products WHERE name = 'Cooking Oil 1L'),           'in', 100, 175, 'Cooking oil restock - 1L bottles',          1, datetime('now', '-18 days')),
((SELECT id FROM products WHERE name = 'Sky Flakes Crackers 250g'), 'in', 300, 500, 'Sky Flakes bulk order',                     1, datetime('now', '-15 days')),
((SELECT id FROM products WHERE name = 'Rolled Oats 500g'),         'in',  80, 140, 'Oats restock',                              1, datetime('now', '-12 days')),
((SELECT id FROM products WHERE name = 'Tuna Flakes in Oil 180g'),  'in', 150, 360, 'Tuna flakes delivery',                      1, datetime('now', '-10 days')),
((SELECT id FROM products WHERE name = 'Powdered Chocolate Drink'), 'in', 120, 210, 'Milo restock',                              1, datetime('now', '-8 days')),
((SELECT id FROM products WHERE name = 'Flat Tops Chocolate 100g'), 'in', 100, 195, 'Flat Tops restock from Mondelez rep',       1, datetime('now', '-5 days')),

-- Stock OUT
((SELECT id FROM products WHERE name = 'Premium White Rice 50kg'),  'out',  50, 135, 'Community store sale - rice',              1, datetime('now', '-29 days')),
((SELECT id FROM products WHERE name = 'Sardines in Tomato Sauce'), 'out',  80, 740, 'Daily sales - sardines',                   1, datetime('now', '-26 days')),
((SELECT id FROM products WHERE name = '3-in-1 Coffee Sachet'),     'out',  60, 290, 'Coffee sachet sales',                      1, datetime('now', '-22 days')),
((SELECT id FROM products WHERE name = 'Corned Beef 150g'),         'out',  40, 390, 'Corned beef sales',                        1, datetime('now', '-21 days')),
((SELECT id FROM products WHERE name = 'Sky Flakes Crackers 250g'), 'out', 100, 400, 'Crackers sold - weekly',                   1, datetime('now', '-14 days')),
((SELECT id FROM products WHERE name = 'Soy Sauce 1L'),             'out',  30, 230, 'Soy sauce sales',                          1, datetime('now', '-13 days')),
((SELECT id FROM products WHERE name = 'Corn Grits 1kg'),           'out',  50, 290, 'Corn grits sold',                          1, datetime('now', '-11 days')),
((SELECT id FROM products WHERE name = 'Tuna Flakes in Oil 180g'),  'out',  60, 300, 'Tuna flakes sold',                         1, datetime('now', '-9 days')),
((SELECT id FROM products WHERE name = 'Cooking Oil 1L'),           'out',  25, 150, 'Cooking oil sold',                         1, datetime('now', '-7 days')),
((SELECT id FROM products WHERE name = 'Nova Country Chips 100g'),  'out',  50, 125, 'Nova chips sold',                          1, datetime('now', '-6 days')),
((SELECT id FROM products WHERE name = 'Powdered Chocolate Drink'), 'out',  30, 180, 'Milo sold',                                1, datetime('now', '-4 days')),
((SELECT id FROM products WHERE name = 'Rolled Oats 500g'),         'out',  20, 120, 'Oats sold',                                1, datetime('now', '-3 days')),
((SELECT id FROM products WHERE name = 'Sardines in Tomato Sauce'), 'out',  40, 700, 'Sardines - weekend sales',                 1, datetime('now', '-2 days')),
((SELECT id FROM products WHERE name = 'Premium White Rice 50kg'),  'out',  30, 105, 'Rice sold - latest batch',                 1, datetime('now', '-1 days')),
((SELECT id FROM products WHERE name = 'Flat Tops Chocolate 100g'), 'out',  20, 175, 'Flat Tops sold today',                     1, datetime('now'));