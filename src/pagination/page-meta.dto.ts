import { ApiProperty } from '@nestjs/swagger';
import { PageOptionsDto } from './page-optiona.dto';

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  item_count: number;
}

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly item_count: number;

  @ApiProperty()
  readonly page_count: number;

  @ApiProperty()
  readonly has_previous_page: boolean;

  @ApiProperty()
  readonly has_next_page: boolean;

  constructor({ pageOptionsDto, item_count }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.item_count = item_count;
    this.page_count = Math.ceil(this.item_count / this.take);
    this.has_next_page = this.page < this.page_count;
    this.has_previous_page = this.page > 1;
  }
}
