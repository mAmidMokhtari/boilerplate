import type { IPaginateModel } from "./paginate.interface";

export class PaginateModel {
  protected props: Partial<IPaginateModel>;

  constructor(data?: Partial<IPaginateModel>) {
    this.props = data ?? {};
  }

  getTotal(): number {
    return this.props.total ?? 0;
  }

  getPerPage(): number {
    return this.props.per_page ?? 0;
  }

  getCurrentPage(): number {
    return this.props.current_page ?? 1;
  }

  getLastPage(): number {
    return this.props.last_page ?? 1;
  }

  getFrom(): number {
    return this.props.from ?? 0;
  }

  getTo(): number {
    return this.props.to ?? 0;
  }

  hasNextPage(): boolean {
    return this.getCurrentPage() < this.getLastPage();
  }

  hasPrevPage(): boolean {
    return this.getCurrentPage() > 1;
  }
}
