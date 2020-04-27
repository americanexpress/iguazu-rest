/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

export const ID_TYPE_ERROR = 'Collection response must be an array of objects containing a unique id key (either "id" by default, or a custom "idKey" of your choice). The ID must be an object, number, or string. For non-compliant API responses, you can transform the data using a custom "transformData" function.';
export const ARRAY_RESPONSE_ERROR = 'Resource call must return an object, not an array';
