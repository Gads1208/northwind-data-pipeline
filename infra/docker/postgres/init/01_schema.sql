-- Northwind Database Schema for PostgreSQL
-- Clean Architecture & Production Ready Setup

CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(25) NOT NULL,
    description TEXT,
    picture BYTEA
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(10) PRIMARY KEY,
    company_name VARCHAR(50) NOT NULL,
    contact_name VARCHAR(40),
    contact_title VARCHAR(40),
    address VARCHAR(60),
    city VARCHAR(30),
    region VARCHAR(30),
    postal_code VARCHAR(15),
    country VARCHAR(30),
    phone VARCHAR(24),
    fax VARCHAR(24)
);

CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    last_name VARCHAR(30) NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    title VARCHAR(40),
    title_of_courtesy VARCHAR(25),
    birth_date DATE,
    hire_date DATE,
    address VARCHAR(60),
    city VARCHAR(30),
    region VARCHAR(30),
    postal_code VARCHAR(15),
    country VARCHAR(30),
    home_phone VARCHAR(24),
    extension VARCHAR(10),
    photo BYTEA,
    notes TEXT,
    reports_to INTEGER,
    photo_path VARCHAR(255),
    FOREIGN KEY (reports_to) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shippers (
    shipper_id SERIAL PRIMARY KEY,
    company_name VARCHAR(40) NOT NULL,
    phone VARCHAR(24)
);

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id SERIAL PRIMARY KEY,
    company_name VARCHAR(50) NOT NULL,
    contact_name VARCHAR(40),
    contact_title VARCHAR(40),
    address VARCHAR(60),
    city VARCHAR(30),
    region VARCHAR(30),
    postal_code VARCHAR(15),
    country VARCHAR(30),
    phone VARCHAR(24),
    fax VARCHAR(24),
    homepage TEXT
);

CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(50) NOT NULL,
    supplier_id INTEGER,
    category_id INTEGER,
    quantity_per_unit VARCHAR(30),
    unit_price NUMERIC(10,2) DEFAULT 0,
    units_in_stock SMALLINT DEFAULT 0,
    units_on_order SMALLINT DEFAULT 0,
    reorder_level SMALLINT DEFAULT 0,
    discontinued INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(10),
    employee_id INTEGER,
    order_date DATE,
    required_date DATE,
    shipped_date DATE,
    ship_via INTEGER,
    freight NUMERIC(10,2) DEFAULT 0,
    ship_name VARCHAR(50),
    ship_address VARCHAR(60),
    ship_city VARCHAR(30),
    ship_region VARCHAR(30),
    ship_postal_code VARCHAR(15),
    ship_country VARCHAR(30),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (ship_via) REFERENCES shippers(shipper_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_details (
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity SMALLINT NOT NULL DEFAULT 1,
    discount REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regions (
    region_id SERIAL PRIMARY KEY,
    region_description VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS territories (
    territory_id VARCHAR(20) PRIMARY KEY,
    territory_description VARCHAR(50) NOT NULL,
    region_id INTEGER NOT NULL,
    FOREIGN KEY (region_id) REFERENCES regions(region_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_territories (
    employee_id INTEGER NOT NULL,
    territory_id VARCHAR(20) NOT NULL,
    PRIMARY KEY (employee_id, territory_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (territory_id) REFERENCES territories(territory_id) ON DELETE CASCADE
);

-- Analytical Views
CREATE OR REPLACE VIEW view_order_details_extended AS
SELECT 
    od.order_id,
    od.product_id,
    p.product_name,
    c.category_name,
    s.company_name AS supplier_name,
    od.unit_price,
    od.quantity,
    od.discount,
    ROUND(CAST((od.unit_price * od.quantity * (1 - od.discount)) AS NUMERIC), 2) AS extended_price
FROM order_details od
JOIN products p ON od.product_id = p.product_id
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id;

CREATE OR REPLACE VIEW view_customer_order_summary AS
SELECT 
    c.customer_id,
    c.company_name,
    c.country,
    c.city,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COALESCE(SUM(v.extended_price), 0) AS total_spent,
    MAX(o.order_date) AS last_order_date
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN view_order_details_extended v ON o.order_id = v.order_id
GROUP BY c.customer_id, c.company_name, c.country, c.city;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_order_details_product_id ON order_details(product_id);
