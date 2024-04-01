class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        const queryObj = {
            ...this.queryStr,
        };
        const exclude = ['page', 'limit', 'fields', 'sort'];
        exclude.forEach((el) => delete queryObj[el]);

        //console.log(req.query, queryObj);

        //2) Advanced Filtering//
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|le)\b/g, (match) => `$${match}`);

        console.log(JSON.parse(queryStr));
        //Execute a query
        //let query = Tour.find(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }


    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            // console.log(sortBy,'..');
            this.query = this.query.sort(sortBy);
        } else {
            this.query.sort('-createdAt'); // To Show up new ones first
        }

        return this;
    }


    limit() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;

        const skip = (page - 1) * limit;

        //&page=1&limit=3
        this.query = this.query.skip(skip).limit(limit);

        // console.log(`Skip value:- ${skip}`);
        return this;
    }
}

module.exports = APIFeatures;