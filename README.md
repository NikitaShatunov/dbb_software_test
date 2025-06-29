# Company Salary System (NestJS)

## Description

This is a test application built with **NestJS** that models a company structure with employees of three types:

- **Employee**
- **Manager**
- **Sales**

Each employee has a name, a date of joining the company, a base salary, an optional supervisor, and (for Managers and Sales) a list of subordinates.

The system supports:

- Creating, updating, and retrieving users
- Calculating individual salaries as of any date
- Calculating the total salary cost of the company

## Salary Calculation Logic

- **Employee**: Base salary + 3% per year of service (capped at 30%)
- **Manager**: Base salary + 5% per year (capped at 40%) + 0.5% of direct subordinates' salaries
- **Sales**: Base salary + 1% per year (capped at 35%) + 0.3% of all subordinate salaries at any level

Recursive logic is used to compute subordinate salaries where applicable.

## Architecture

A `UsersModule` was created, containing the controller, service, and entity definitions.  
User roles (`Employee`, `Manager`, `Sales`) are managed using an `enum` to ensure consistency.

Salary calculation is implemented in a dedicated `calculateSalary()` method, which includes recursive processing when needed.

## Features

- User creation and update
- Search by name or role
- Pagination for user lists
- Salary calculation by user ID and current date
- Company-wide total salary calculation

## API & Documentation

API documentation is available via **Swagger** at `/api`.  
DTOs for `POST` and `PUT` requests include validation and example schemas.

## Testing

Unit tests are included for:

- Total salary aggregation
- Fetching salary by user ID

## Improvements

- Additional test cases can be added for edge conditions and error handling
- Salary calculation logic could be extracted into a separate strategy class or service for better separation of concerns

## Tech Stack

- NestJS
- TypeORM
- MySql
- Swagger (API documentation)
- Jest (unit testing)
