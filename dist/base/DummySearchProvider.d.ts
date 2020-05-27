import { IDummyDataSource } from '../config';
import '../scss/style.scss';
import { IResult, ISearchProvider } from 'tdp_core/src/public/search';
export declare class DummySearchProvider implements ISearchProvider {
    private readonly dataSource;
    constructor(dataSource: IDummyDataSource);
    search(query: string, page: number, pageSize: number): Promise<Readonly<import("tdp_core/src/rest").ILookupResult>>;
    validate(query: string[]): Promise<IResult[]>;
}
export declare function createA(): DummySearchProvider;
export declare function createB(): DummySearchProvider;
