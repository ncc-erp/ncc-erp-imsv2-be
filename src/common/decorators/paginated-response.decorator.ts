/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageableDTO } from '@common/dto/pageable.dto';

interface IPaginatedDecoratorApiResponse {
  model: Type;
  description?: string;
}

export const ApiPaginatedResponse = (
  options: IPaginatedDecoratorApiResponse,
) => {
  return applyDecorators(
    ApiExtraModels(PageableDTO, options.model),
    ApiOkResponse({
      description: options.description || 'Successfully received model list',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PageableDTO) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(options.model) },
              },
            },
          },
        ],
      },
    }),
  );
};
