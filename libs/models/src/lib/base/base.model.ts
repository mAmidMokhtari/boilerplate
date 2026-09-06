import type { IBaseModel } from "./base.interface";

/**
 * Root of every domain model.
 *
 * A model is a thin class over the raw API payload: it stores `props`
 * untouched and exposes null-safe getters. It never fetches, never mutates
 * the payload, and never contains business workflows — those live in hooks.
 */
export abstract class BaseModel<TProps extends IBaseModel = IBaseModel> {
  protected props: Partial<TProps>;

  constructor(data?: Partial<TProps>) {
    this.props = data ?? {};
  }

  getId(): number {
    return this.props.id ?? 0;
  }

  getCreatedAt(): Date | null {
    return this.props.created_at ? new Date(this.props.created_at) : null;
  }

  getUpdatedAt(): Date | null {
    return this.props.updated_at ? new Date(this.props.updated_at) : null;
  }

  getDeletedAt(): Date | null {
    return this.props.deleted_at ? new Date(this.props.deleted_at) : null;
  }

  isDeleted(): boolean {
    return !!this.props.deleted_at;
  }

  /** Raw payload, for the rare case a consumer needs to forward it verbatim. */
  toJSON(): Partial<TProps> {
    return this.props;
  }
}
