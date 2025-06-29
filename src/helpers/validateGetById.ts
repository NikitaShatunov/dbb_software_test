import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * @param id Id of the item.
 * @param item Item to check.
 * @param name Name of the item, used in error message.
 * @throws {HttpException} HttpException with NOT_FOUND status if item is falsy.
 */
function validateGetById(id: number, item: any, name: string) {
  if (!item) {
    throw new HttpException(
      `There is no ${name} with id: ${id}`,
      HttpStatus.NOT_FOUND,
    );
  }
}
export { validateGetById };
