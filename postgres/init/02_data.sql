-- Insert sample data into Northwind database

-- Categories
INSERT INTO categories (category_name, description) VALUES
('Beverages', 'Soft drinks, coffees, teas, beers, and ales'),
('Condiments', 'Sweet and savory sauces, relishes, spreads, and seasonings'),
('Confections', 'Desserts, candies, and sweet breads'),
('Dairy Products', 'Cheeses'),
('Grains/Cereals', 'Breads, crackers, pasta, and cereal'),
('Meat/Poultry', 'Prepared meats'),
('Produce', 'Dried fruit and bean curd'),
('Seafood', 'Seaweed and fish');

-- Customers
INSERT INTO customers (customer_id, company_name, contact_name, contact_title, address, city, region, postal_code, country, phone) VALUES
('ALFKI', 'Alfreds Futterkiste', 'Maria Anders', 'Sales Representative', 'Obere Str. 57', 'Berlin', NULL, '12209', 'Germany', '030-0074321'),
('ANATR', 'Ana Trujillo Emparedados y helados', 'Ana Trujillo', 'Owner', 'Avda. de la Constitución 2222', 'México D.F.', NULL, '05021', 'Mexico', '(5) 555-4729'),
('ANTON', 'Antonio Moreno Taquería', 'Antonio Moreno', 'Owner', 'Mataderos 2312', 'México D.F.', NULL, '05023', 'Mexico', '(5) 555-3932'),
('AROUT', 'Around the Horn', 'Thomas Hardy', 'Sales Representative', '120 Hanover Sq.', 'London', NULL, 'WA1 1DP', 'UK', '(171) 555-7788'),
('BERGS', 'Berglunds snabbköp', 'Christina Berglund', 'Order Administrator', 'Berguvsvägen 8', 'Luleå', NULL, 'S-958 22', 'Sweden', '0921-12 34 65');

-- Suppliers
INSERT INTO suppliers (company_name, contact_name, contact_title, address, city, region, postal_code, country, phone) VALUES
('Exotic Liquids', 'Charlotte Cooper', 'Purchasing Manager', '49 Gilbert St.', 'London', NULL, 'EC1 4SD', 'UK', '(171) 555-2222'),
('New Orleans Cajun Delights', 'Shelley Burke', 'Order Administrator', 'P.O. Box 78934', 'New Orleans', 'LA', '70117', 'USA', '(100) 555-4822'),
('Grandma Kelly''s Homestead', 'Regina Murphy', 'Sales Representative', '707 Oxford Rd.', 'Ann Arbor', 'MI', '48104', 'USA', '(313) 555-5735'),
('Tokyo Traders', 'Yoshi Nagase', 'Marketing Manager', '9-8 Sekimai Musashino-shi', 'Tokyo', NULL, '100', 'Japan', '(03) 3555-5011');

-- Employees
INSERT INTO employees (last_name, first_name, title, title_of_courtesy, birth_date, hire_date, address, city, region, postal_code, country, home_phone) VALUES
('Davolio', 'Nancy', 'Sales Representative', 'Ms.', '1948-12-08', '1992-05-01', '507 - 20th Ave. E. Apt. 2A', 'Seattle', 'WA', '98122', 'USA', '(206) 555-9857'),
('Fuller', 'Andrew', 'Vice President, Sales', 'Dr.', '1952-02-19', '1992-08-14', '908 W. Capital Way', 'Tacoma', 'WA', '98401', 'USA', '(206) 555-9482'),
('Leverling', 'Janet', 'Sales Representative', 'Ms.', '1963-08-30', '1992-04-01', '722 Moss Bay Blvd.', 'Kirkland', 'WA', '98033', 'USA', '(206) 555-3412'),
('Peacock', 'Margaret', 'Sales Representative', 'Mrs.', '1937-09-19', '1993-05-03', '4110 Old Redmond Rd.', 'Redmond', 'WA', '98052', 'USA', '(206) 555-8122'),
('Buchanan', 'Steven', 'Sales Manager', 'Mr.', '1955-03-04', '1993-10-17', '14 Garrett Hill', 'London', NULL, 'SW1 8JR', 'UK', '(71) 555-4848');

-- Shippers
INSERT INTO shippers (company_name, phone) VALUES
('Speedy Express', '(503) 555-9831'),
('United Package', '(503) 555-3199'),
('Federal Shipping', '(503) 555-9931');

-- Products
INSERT INTO products (product_name, supplier_id, category_id, quantity_per_unit, unit_price, units_in_stock, units_on_order, reorder_level, discontinued) VALUES
('Chai', 1, 1, '10 boxes x 20 bags', 18.00, 39, 0, 10, 0),
('Chang', 1, 1, '24 - 12 oz bottles', 19.00, 17, 40, 25, 0),
('Aniseed Syrup', 1, 2, '12 - 550 ml bottles', 10.00, 13, 70, 25, 0),
('Chef Anton''s Cajun Seasoning', 2, 2, '48 - 6 oz jars', 22.00, 53, 0, 0, 0),
('Chef Anton''s Gumbo Mix', 2, 2, '36 boxes', 21.35, 0, 0, 0, 1),
('Grandma''s Boysenberry Spread', 3, 2, '12 - 8 oz jars', 25.00, 120, 0, 25, 0),
('Uncle Bob''s Organic Dried Pears', 3, 7, '12 - 1 lb pkgs.', 30.00, 15, 0, 10, 0),
('Northwoods Cranberry Sauce', 3, 2, '12 - 12 oz jars', 40.00, 6, 0, 0, 0),
('Mishi Kobe Niku', 4, 6, '18 - 500 g pkgs.', 97.00, 29, 0, 0, 1),
('Ikura', 4, 8, '12 - 200 ml jars', 31.00, 31, 0, 0, 0);

-- Orders
INSERT INTO orders (customer_id, employee_id, order_date, required_date, shipped_date, ship_via, freight, ship_name, ship_address, ship_city, ship_postal_code, ship_country) VALUES
('ALFKI', 1, '2024-07-04', '2024-08-01', '2024-07-16', 3, 32.38, 'Alfreds Futterkiste', 'Obere Str. 57', 'Berlin', '12209', 'Germany'),
('ANATR', 2, '2024-07-05', '2024-08-16', '2024-07-10', 2, 11.61, 'Ana Trujillo Emparedados y helados', 'Avda. de la Constitución 2222', 'México D.F.', '05021', 'Mexico'),
('ANTON', 3, '2024-07-08', '2024-08-05', '2024-07-12', 1, 65.83, 'Antonio Moreno Taquería', 'Mataderos 2312', 'México D.F.', '05023', 'Mexico'),
('AROUT', 4, '2024-07-09', '2024-08-06', '2024-07-15', 2, 41.34, 'Around the Horn', '120 Hanover Sq.', 'London', 'WA1 1DP', 'UK'),
('BERGS', 5, '2024-07-10', '2024-08-07', '2024-07-20', 3, 51.30, 'Berglunds snabbköp', 'Berguvsvägen 8', 'Luleå', 'S-958 22', 'Sweden');

-- Order Details
INSERT INTO order_details (order_id, product_id, unit_price, quantity, discount) VALUES
(1, 1, 18.00, 12, 0),
(1, 2, 19.00, 10, 0),
(1, 3, 10.00, 5, 0),
(2, 4, 22.00, 9, 0),
(2, 5, 21.35, 40, 0.05),
(3, 6, 25.00, 10, 0),
(3, 7, 30.00, 35, 0.15),
(4, 8, 40.00, 15, 0),
(4, 1, 18.00, 21, 0.1),
(5, 2, 19.00, 20, 0),
(5, 10, 31.00, 40, 0);

-- Regions
INSERT INTO regions (region_description) VALUES
('Eastern'),
('Western'),
('Northern'),
('Southern');

-- Territories
INSERT INTO territories (territory_id, territory_description, region_id) VALUES
('01581', 'Westboro', 1),
('01730', 'Bedford', 1),
('01833', 'Georgetow', 1),
('02116', 'Boston', 1),
('02139', 'Cambridge', 1),
('02184', 'Braintree', 1),
('02903', 'Providence', 1);

-- Employee Territories
INSERT INTO employee_territories (employee_id, territory_id) VALUES
(1, '01581'),
(1, '01730'),
(2, '01833'),
(2, '02116'),
(3, '02139'),
(4, '02184'),
(5, '02903');
