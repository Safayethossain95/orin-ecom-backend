class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excluded = ["page", "sort", "limit", "fields", "keyword"];
    const filters = { ...this.queryString };
    excluded.forEach((field) => delete filters[field]);

    this.query = this.query.find(filters);
    return this;
  }

  search(fields) {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword;
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: { $regex: keyword, $options: "i" } })),
      });
    }

    return this;
  }

  sort() {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(",").join(" ")
      : "-createdAt";
    this.query = this.query.sort(sortBy);
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields.split(",").join(" "));
    }

    return this;
  }

  paginate() {
    const page = Math.max(Number(this.queryString.page || 1), 1);
    const limit = Math.min(Math.max(Number(this.queryString.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;
