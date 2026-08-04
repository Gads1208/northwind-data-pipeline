-- Insert rich Northwind dataset into PostgreSQL database

-- Categories
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Beverages', 'Soft drinks, coffees, teas, beers, and ales'),
(2, 'Condiments', 'Sweet and savory sauces, relishes, spreads, and seasonings'),
(3, 'Confections', 'Desserts, candies, and sweet breads'),
(4, 'Dairy Products', 'Cheeses, milk, butter, and creams'),
(5, 'Grains/Cereals', 'Breads, crackers, pasta, and cereal'),
(6, 'Meat/Poultry', 'Prepared meats, poultry, and gourmet specialty cuts'),
(7, 'Produce', 'Dried fruit, organic vegetables, and bean curd'),
(8, 'Seafood', 'Seaweed, fresh caviar, shrimp, and ocean fish')
ON CONFLICT (category_id) DO NOTHING;

-- Shippers
INSERT INTO shippers (shipper_id, company_name, phone) VALUES
(1, 'Speedy Express', '(503) 555-9831'),
(2, 'United Package', '(503) 555-3199'),
(3, 'Federal Shipping', '(503) 555-9931')
ON CONFLICT (shipper_id) DO NOTHING;

-- Suppliers
INSERT INTO suppliers (supplier_id, company_name, contact_name, contact_title, address, city, region, postal_code, country, phone) VALUES
(1, 'Exotic Liquids', 'Charlotte Cooper', 'Purchasing Manager', '49 Gilbert St.', 'London', NULL, 'EC1 4SD', 'UK', '(171) 555-2222'),
(2, 'New Orleans Cajun Delights', 'Shelley Burke', 'Order Administrator', 'P.O. Box 78934', 'New Orleans', 'LA', '70117', 'USA', '(100) 555-4822'),
(3, 'Grandma Kelly''s Homestead', 'Regina Murphy', 'Sales Representative', '707 Oxford Rd.', 'Ann Arbor', 'MI', '48104', 'USA', '(313) 555-5735'),
(4, 'Tokyo Traders', 'Yoshi Nagase', 'Marketing Manager', '9-8 Sekimai Musashino-shi', 'Tokyo', NULL, '100', 'Japan', '(03) 3555-5011'),
(5, 'Cooperativa de Quesos ''Las Cabras''', 'Antonio del Valle Saavedra', 'Export Administrator', 'Calle del Rosal 4', 'Oviedo', 'Asturias', '33007', 'Spain', '(98) 598 76 54')
ON CONFLICT (supplier_id) DO NOTHING;

-- Employees
INSERT INTO employees (employee_id, last_name, first_name, title, title_of_courtesy, birth_date, hire_date, address, city, region, postal_code, country, home_phone) VALUES
(1, 'Davolio', 'Nancy', 'Sales Representative', 'Ms.', '1968-12-08', '1992-05-01', '507 - 20th Ave. E. Apt. 2A', 'Seattle', 'WA', '98122', 'USA', '(206) 555-9857'),
(2, 'Fuller', 'Andrew', 'Vice President, Sales', 'Dr.', '1952-02-19', '1992-08-14', '908 W. Capital Way', 'Tacoma', 'WA', '98401', 'USA', '(206) 555-9482'),
(3, 'Leverling', 'Janet', 'Sales Representative', 'Ms.', '1963-08-30', '1992-04-01', '722 Moss Bay Blvd.', 'Kirkland', 'WA', '98033', 'USA', '(206) 555-3412'),
(4, 'Peacock', 'Margaret', 'Sales Representative', 'Mrs.', '1957-09-19', '1993-05-03', '4110 Old Redmond Rd.', 'Redmond', 'WA', '98052', 'USA', '(206) 555-8122'),
(5, 'Buchanan', 'Steven', 'Sales Manager', 'Mr.', '1955-03-04', '1993-10-17', '14 Garrett Hill', 'London', NULL, 'SW1 8JR', 'UK', '(71) 555-4848'),
(6, 'Suyama', 'Michael', 'Sales Representative', 'Mr.', '1963-07-02', '1993-10-17', 'Coventry House Miner Rd.', 'London', NULL, 'EC2 7JR', 'UK', '(71) 555-7773')
ON CONFLICT (employee_id) DO NOTHING;

-- Customers
INSERT INTO customers (customer_id, company_name, contact_name, contact_title, address, city, region, postal_code, country, phone) VALUES
('ALFKI', 'Alfreds Futterkiste', 'Maria Anders', 'Sales Representative', 'Obere Str. 57', 'Berlin', NULL, '12209', 'Germany', '030-0074321'),
('ANATR', 'Ana Trujillo Emparedados y helados', 'Ana Trujillo', 'Owner', 'Avda. de la Constitución 2222', 'México D.F.', NULL, '05021', 'Mexico', '(5) 555-4729'),
('ANTON', 'Antonio Moreno Taquería', 'Antonio Moreno', 'Owner', 'Mataderos 2312', 'México D.F.', NULL, '05023', 'Mexico', '(5) 555-3932'),
('AROUT', 'Around the Horn', 'Thomas Hardy', 'Sales Representative', '120 Hanover Sq.', 'London', NULL, 'WA1 1DP', 'UK', '(171) 555-7788'),
('BERGS', 'Berglunds snabbköp', 'Christina Berglund', 'Order Administrator', 'Berguvsvägen 8', 'Luleå', NULL, 'S-958 22', 'Sweden', '0921-12 34 65'),
('BLONP', 'Blondel père et fils', 'Frédérique Citeaux', 'Marketing Manager', '24, place Kléber', 'Strasbourg', NULL, '67000', 'France', '88.60.15.31'),
('BOLID', 'Bólido Comidas preparadas', 'Martín Sommer', 'Owner', 'C/ Araquil, 67', 'Madrid', NULL, '28023', 'Spain', '(91) 555 22 82'),
('BONAP', 'Bon app''', 'Laurence Lebihan', 'Owner', '12, rue des Bouchers', 'Marseille', NULL, '13008', 'France', '91.24.45.40'),
('BOTTM', 'Bottom-Dollar Markets', 'Elizabeth Lincoln', 'Accounting Manager', '23 Tsawassen Blvd.', 'Tsawassen', 'BC', 'T2F 8M4', 'Canada', '(604) 555-4729'),
('BSBEV', 'B''s Beverages', 'Victoria Ashworth', 'Sales Representative', 'Fauntleroy Circus', 'London', NULL, 'EC2 5NT', 'UK', '(171) 555-1212'),
('QUICK', 'QUICK-Stop', 'Horst Kloss', 'Accounting Manager', 'Taucherstraße 10', 'Cunewalde', NULL, '01307', 'Germany', '03721-0842'),
('RATTC', 'Rattlesnake Canyon Grocery', 'Paula Wilson', 'Assistant Sales Representative', '2817 Milton Dr.', 'Albuquerque', 'NM', '87110', 'USA', '(505) 555-5939'),
('SAVEA', 'Save-a-lot Markets', 'Jose Pavarotti', 'Sales Representative', '187 Suffolk Ln.', 'Boise', 'ID', '83720', 'USA', '(208) 555-8097'),
('ERNSH', 'Ernst Handel', 'Roland Mendel', 'Sales Manager', 'Kirchgasse 6', 'Graz', NULL, '8010', 'Austria', '7675-3425'),
('VINET', 'Vins et alcools Chevalier', 'Paul Henriot', 'Accounting Manager', '59 rue de l''Abbaye', 'Reims', NULL, '51100', 'France', '26.47.15.10'),
('TOMSP', 'Toms Spezialitäten', 'Karin Josephs', 'Marketing Manager', 'Luisenstr. 48', 'Münster', NULL, '44087', 'Germany', '0251-031259'),
('HANAR', 'Hanari Carnes', 'Mario Pontes', 'Accounting Manager', 'Rua da Panificadora, 12', 'Rio de Janeiro', 'RJ', '05454-876', 'Brazil', '(21) 555-0091'),
('VICTE', 'Victuailles en stock', 'Mary Saveley', 'Sales Agent', '2, rue du Commerce', 'Lyon', NULL, '69004', 'France', '78.32.54.86'),
('SUPRD', 'Suprêmes délices', 'Pascale Cartrain', 'Accounting Manager', 'Boulevard Tirou, 255', 'Charleroi', NULL, 'B-6000', 'Belgium', '(071) 23 67 22'),
('CHOPS', 'Chop-suey Chinese', 'Yang Bo', 'Owner', 'Hauptstr. 31', 'Bern', NULL, '3012', 'Switzerland', '031-9876543'),
('RICSU', 'Richter Supermarkt', 'Michael Holz', 'Sales Manager', 'Starenweg 5', 'Genève', NULL, '1204', 'Switzerland', '0897-067534'),
('WELLI', 'Wellington Importadora', 'Paula Parente', 'Sales Manager', 'Rua do Mercado, 12', 'Resende', 'SP', '08737-363', 'Brazil', '(14) 555-8122'),
('HILAA', 'HILARION-Abastos', 'Carlos Hernández', 'Sales Representative', 'Carrera 22 con Ave. Carlos Soublette #8-35', 'San Cristóbal', 'Táchira', '5001', 'Venezuela', '(5) 555-1340')
ON CONFLICT (customer_id) DO NOTHING;

-- Products
INSERT INTO products (product_id, product_name, supplier_id, category_id, quantity_per_unit, unit_price, units_in_stock, units_on_order, reorder_level, discontinued) VALUES
(1, 'Chai', 1, 1, '10 boxes x 20 bags', 18.00, 39, 0, 10, 0),
(2, 'Chang', 1, 1, '24 - 12 oz bottles', 19.00, 17, 40, 25, 0),
(3, 'Aniseed Syrup', 1, 2, '12 - 550 ml bottles', 10.00, 13, 70, 25, 0),
(4, 'Chef Anton''s Cajun Seasoning', 2, 2, '48 - 6 oz jars', 22.00, 53, 0, 0, 0),
(5, 'Chef Anton''s Gumbo Mix', 2, 2, '36 boxes', 21.35, 0, 0, 0, 1),
(6, 'Grandma''s Boysenberry Spread', 3, 2, '12 - 8 oz jars', 25.00, 120, 0, 25, 0),
(7, 'Uncle Bob''s Organic Dried Pears', 3, 7, '12 - 1 lb pkgs.', 30.00, 15, 0, 10, 0),
(8, 'Northwoods Cranberry Sauce', 3, 2, '12 - 12 oz jars', 40.00, 6, 0, 0, 0),
(9, 'Mishi Kobe Niku', 4, 6, '18 - 500 g pkgs.', 97.00, 29, 0, 0, 1),
(10, 'Ikura', 4, 8, '12 - 200 ml jars', 31.00, 31, 0, 0, 0),
(11, 'Queso Cabrales', 5, 4, '1 kg pkg.', 21.00, 22, 30, 30, 0),
(12, 'Queso Manchego La Pastora', 5, 4, '10 - 500 g pkgs.', 38.00, 86, 0, 0, 0)
ON CONFLICT (product_id) DO NOTHING;

-- Orders (Historical from 1997, 1998, plus recent)
INSERT INTO orders (order_id, customer_id, employee_id, order_date, required_date, shipped_date, ship_via, freight, ship_name, ship_address, ship_city, ship_region, ship_postal_code, ship_country) VALUES
(10248, 'VINET', 5, '1998-07-04', '1998-08-01', '1998-07-16', 3, 32.38, 'Vins et alcools Chevalier', '59 rue de l''Abbaye', 'Reims', NULL, '51100', 'France'),
(10249, 'TOMSP', 6, '1998-07-05', '1998-08-16', '1998-07-10', 1, 11.61, 'Toms Spezialitäten', 'Luisenstr. 48', 'Münster', NULL, '44087', 'Germany'),
(10250, 'HANAR', 4, '1998-07-08', '1998-08-05', '1998-07-12', 2, 65.83, 'Hanari Carnes', 'Rua da Panificadora, 12', 'Rio de Janeiro', 'RJ', '05454-876', 'Brazil'),
(10251, 'VICTE', 3, '1998-07-08', '1998-08-05', '1998-07-15', 1, 41.34, 'Victuailles en stock', '2, rue du Commerce', 'Lyon', NULL, '69004', 'France'),
(10252, 'SUPRD', 4, '1998-07-09', '1998-08-06', '1998-07-11', 2, 51.30, 'Suprêmes délices', 'Boulevard Tirou, 255', 'Charleroi', NULL, 'B-6000', 'Belgium'),
(10253, 'HANAR', 3, '1998-07-10', '1998-07-24', '1998-07-16', 2, 58.17, 'Hanari Carnes', 'Rua da Panificadora, 12', 'Rio de Janeiro', 'RJ', '05454-876', 'Brazil'),
(10254, 'CHOPS', 5, '1998-07-11', '1998-08-08', '1998-07-23', 2, 22.98, 'Chop-suey Chinese', 'Hauptstr. 31', 'Bern', NULL, '3012', 'Switzerland'),
(10255, 'RICSU', 1, '1998-07-12', '1998-08-09', '1998-07-15', 3, 148.33, 'Richter Supermarkt', 'Starenweg 5', 'Genève', NULL, '1204', 'Switzerland'),
(10256, 'WELLI', 3, '1998-07-15', '1998-08-12', '1998-07-17', 2, 13.97, 'Wellington Importadora', 'Rua do Mercado, 12', 'Resende', 'SP', '08737-363', 'Brazil'),
(10257, 'HILAA', 4, '1998-07-16', '1998-08-13', '1998-07-22', 3, 81.91, 'HILARION-Abastos', 'Carrera 22 con Ave. Carlos Soublette #8-35', 'San Cristóbal', 'Táchira', '5001', 'Venezuela'),
(10258, 'ERNSH', 1, '1998-07-17', '1998-08-14', '1998-07-23', 1, 140.51, 'Ernst Handel', 'Kirchgasse 6', 'Graz', NULL, '8010', 'Austria'),
(10259, 'SAVEA', 4, '1998-07-18', '1998-08-15', '1998-07-25', 3, 325.21, 'Save-a-lot Markets', '187 Suffolk Ln.', 'Boise', 'ID', '83720', 'USA'),
(10260, 'QUICK', 2, '1998-07-19', '1998-08-16', '1998-07-29', 1, 172.84, 'QUICK-Stop', 'Taucherstraße 10', 'Cunewalde', NULL, '01307', 'Germany'),
(10261, 'RATTC', 4, '1998-07-20', '1998-08-17', '1998-07-30', 2, 94.61, 'Rattlesnake Canyon Grocery', '2817 Milton Dr.', 'Albuquerque', 'NM', '87110', 'USA')
ON CONFLICT (order_id) DO NOTHING;

-- Order Details
INSERT INTO order_details (order_id, product_id, unit_price, quantity, discount) VALUES
(10248, 1, 18.00, 12, 0),
(10248, 2, 19.00, 10, 0),
(10248, 3, 10.00, 5, 0),
(10249, 4, 22.00, 9, 0),
(10249, 5, 21.35, 40, 0.05),
(10250, 6, 25.00, 10, 0),
(10250, 7, 30.00, 35, 0.15),
(10251, 8, 40.00, 15, 0),
(10251, 1, 18.00, 21, 0.1),
(10252, 2, 19.00, 20, 0),
(10252, 10, 31.00, 40, 0),
(10253, 11, 21.00, 15, 0),
(10253, 12, 38.00, 12, 0),
(10254, 1, 18.00, 25, 0.1),
(10255, 9, 97.00, 30, 0.05),
(10256, 3, 10.00, 18, 0),
(10257, 4, 22.00, 25, 0),
(10258, 6, 25.00, 50, 0.1),
(10258, 12, 38.00, 45, 0.15),
(10259, 9, 97.00, 100, 0.2),
(10260, 11, 21.00, 60, 0.05),
(10261, 7, 30.00, 40, 0)
ON CONFLICT (order_id, product_id) DO NOTHING;

-- Regions
INSERT INTO regions (region_id, region_description) VALUES
(1, 'Eastern'),
(2, 'Western'),
(3, 'Northern'),
(4, 'Southern')
ON CONFLICT (region_id) DO NOTHING;

-- Reset Sequences
SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));
SELECT setval('employees_employee_id_seq', (SELECT MAX(employee_id) FROM employees));
SELECT setval('shippers_shipper_id_seq', (SELECT MAX(shipper_id) FROM shippers));
SELECT setval('suppliers_supplier_id_seq', (SELECT MAX(supplier_id) FROM suppliers));
SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));
