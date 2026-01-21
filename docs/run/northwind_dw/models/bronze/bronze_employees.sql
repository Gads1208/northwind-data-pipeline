

  create or replace view `portifolio-482811`.`northwind_bronze`.`bronze_employees`
  OPTIONS()
  as -- Bronze layer: Raw data from PostgreSQL ingestion



SELECT *
FROM `portifolio-482811.northwind_bronze.bronze_employees`;

