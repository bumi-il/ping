class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    create(data) {
        return this.model.create(data);
    }

    findById(id, options = {}) {
        const query = this.model.findById(id);
        return this.applyReadOptions(query, options);
    }

    findOne(filter = {}, options = {}) {
        const query = this.model.findOne(filter);
        return this.applyReadOptions(query, options);
    }

    findMany(filter = {}, options = {}) {
        const { limit = 20, page = 1, sort = { createdAt: -1 } } = options;

        const skip = (page - 1) * limit;
        const query = this.model.find(filter).sort(sort).skip(skip).limit(limit);

        return this.applyReadOptions(query, options);
    }

    updateById(id, data, options = {}) {
        return this.model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
            ...options,
        });
    }

    updateOne(filter, data, options = {}) {
        return this.model.findOneAndUpdate(filter, data, {
            new: true,
            runValidators: true,
            ...options,
        });
    }

    deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }

    deleteOne(filter) {
        return this.model.findOneAndDelete(filter);
    }

    count(filter = {}) {
        return this.model.countDocuments(filter);
    }

    applyReadOptions(query, options = {}) {
        const { select, populate, lean } = options;

        if (select) {
            query.select(select);
        }

        if (populate) {
            query.populate(populate);
        }

        if (lean) {
            query.lean();
        }

        return query;
    }
}

export default BaseRepository;
