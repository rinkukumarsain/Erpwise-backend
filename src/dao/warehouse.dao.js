const mongoose = require('mongoose');

/**
 * Options for customizing the lead retrieval.
 *
 * @typedef {object} GetAllLeadOptions
 * @property {boolean} isActive - Filter leads based on their activation status.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of leads to display per page.
 * @property {string} sortBy - Field to sort by.
 * @property {string} sortOrder - Sort order.
 * @property {string} search - complete search on all fields.
 * @property {string} salesPerson - search on sales person.
 * @property {number} level - The level of the lead.
 */

/**
 * Generates an aggregation pipeline to retrieve all warehouse.
 *
 * @param {string} orgId - The organissation unique identifier.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllWarehousePipeline = (orgId) => [
    {
        $match: {
            isDeleted: false,
            organisationId: new mongoose.Types.ObjectId(orgId)
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'managers',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        password: 0,
                        token: 0
                    }
                }
            ],
            as: 'managers'
        }
    }
];


/**
 * Generates an aggregation pipeline to retrieve all warehouse goods in data for dashboard.
 *
 * @param {string} orgId - org id.
 * @param {GetAllLeadOptions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllGoodsInPipeline = (orgId, { page, perPage, sortBy, sortOrder, search }) => {
    let pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                isActive: true,
                isDeleted: false,
                shipTo: 'warehouse',
                level: {
                    $eq: 2
                }
            }
        },
        {
            $skip: (page - 1) * perPage
        },
        {
            $limit: perPage
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'supplierId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            companyName: 1,
                            Id: 1
                        }
                    }
                ],
                as: 'supplierDetails'
            }
        },
        {
            $unwind: {
                path: '$supplierDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'enquiries',
                localField: 'enquiryId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            companyName: 1,
                            Id: 1
                        }
                    }
                ],
                as: 'enquiryDetails'
            }
        },
        {
            $unwind: {
                path: '$enquiryDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                Id: 1,
                enquiryId: 1,
                supplierPoId: 1,
                supplierId: 1,
                warehouseId: 1,
                shipToWarehouse: 1,
                idEnquiry: '$enquiryDetails.Id',
                enquiryCompanyName: '$enquiryDetails.companyName',
                idSupplier: '$supplierDetails.Id',
                supplieCompanyName: '$supplierDetails.companyName',
                shipQuantity: 1,
                totalPrice: 1,
                receivedDate: {
                    $cond: {
                        if: { $ne: ['$shipmentDispatched.warehouseRecievedDate', null] },
                        then: '$shipmentDispatched.warehouseRecievedDate',
                        else: null
                    }
                },
                status: '$shipmentDispatched.isGoodsAccepted'
            }
        }
    ];

    if (search) {
        let obj = {
            '$match': {
                '$or': [
                    { Id: { $regex: `${search}.*`, $options: 'i' } },
                    { shipToWarehouse: { $regex: `${search}.*`, $options: 'i' } },
                    { idEnquiry: { $regex: `${search}.*`, $options: 'i' } },
                    { enquiryCompanyName: { $regex: `${search}.*`, $options: 'i' } },
                    { idSupplier: { $regex: `${search}.*`, $options: 'i' } },
                    { supplieCompanyName: { $regex: `${search}.*`, $options: 'i' } },
                    { totalPrice: Number(search) || 0 }
                ]
            }
        };
        pipeline.push(obj);
    }

    if (sortBy && sortOrder) {
        let obj = {
            '$sort': {
                [sortBy]: sortOrder === 'desc' ? -1 : 1
            }
        };
        pipeline.push(obj);
    }
    // console.log('::::', JSON.stringify(pipeline));
    return pipeline;
};

/**
 * Generates an aggregation pipeline to retrieve warehouse goods in data for dashboard by id.
 *
 * @param {string} orgId - org id.
 * @param {string} shipmentId - org id.
 * @returns {Array} - An aggregation pipeline
 */
exports.getGoodsInByIdPipeline = (orgId, shipmentId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId),
            _id: new mongoose.Types.ObjectId(shipmentId),
            isActive: true,
            isDeleted: false,
            shipTo: 'warehouse',
            level: {
                $eq: 2
            }
        }
    },
    {
        $lookup: {
            from: 'suppliers',
            localField: 'supplierId',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        companyName: 1,
                        Id: 1,
                        email: 1,
                        phone: 1
                    }
                }
            ],
            as: 'supplierDetails'
        }
    },
    {
        $unwind: {
            path: '$supplierDetails',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'enquiries',
            localField: 'enquiryId',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        companyName: 1,
                        Id: 1,
                        email: 1,
                        phone: 1,
                        leadId: 1
                    }
                },
                {
                    $lookup: {
                        from: 'leads',
                        localField: 'leadId',
                        foreignField: '_id',
                        pipeline: [
                            {
                                $project: {
                                    address: 1
                                }
                            }
                        ],
                        as: 'address'
                    }
                },
                {
                    $unwind: {
                        path: '$address'
                    }
                },
                {
                    $addFields: {
                        address: '$address.address'
                    }
                }
            ],
            as: 'enquiryDetails'
        }
    },
    {
        $unwind: {
            path: '$enquiryDetails',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'warehouses',
            localField: 'warehouseId',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        email: 1,
                        name: 1
                    }
                }
            ],
            as: 'warehouseName'
        }
    },
    {
        $unwind: {
            path: '$warehouseName',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $addFields:{
            warehouseEmail: '$warehouseName.email',
            warehouseName: '$warehouseName.name'
        }
    },
    {
        $lookup:{
            from: 'enquirysupplierpos',
            localField: 'supplierPoId',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        Id: 1
                    }
                }
            ],
            as: 'supplierPoNo'
        }
    },
    {
        $addFields:{
            supplierPoNo: {
                $arrayElemAt: ['$supplierPoNo.Id', 0]
            }
        }
    },
    {
        $lookup:{
            from: 'enquirysupplierbills',
            localField: 'supplierBillId',
            foreignField: '_id',
            as: 'supplierBillRefNo'
        }
    },
    {
        $addFields: {
            supplierBillRefNoLen: {
                $size: '$supplierBillRefNo'
            }
        }
    },
    {
        $addFields:{
            supplierBillRefNo: {
                $cond: {
                    if: {
                        $eq: ['$supplierBillRefNoLen', 0]
                    },
                    then: null,
                    else: {
                        $arrayElemAt: [
                            '$supplierBillRefNo.supplierRefNo',
                            0
                        ]
                    }
                }
            }
        }
    },
    {
        $project: {
            supplierBillRefNoLen: 0
        }
    }
];