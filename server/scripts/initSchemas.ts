import BaseModel from "../models/utils/baseModel";
import {
    ArticlesModel,
    CaseStudiesModel,
    DocumentsModel,
    ExperienceModel,
    ProjectModel,
    ServicesModel,
    SkillModel,
    UpdatesModel,
} from "../models";

new ArticlesModel();
new SkillModel();
new CaseStudiesModel();
new DocumentsModel();
new ExperienceModel();
new ProjectModel();
new ServicesModel();
new UpdatesModel();

BaseModel.initSchemas();
