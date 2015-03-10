from tastypie.authorization import Authorization
from tastypie.resources import Resource
from tastypie import fields
from tastypie.bundle import Bundle

from apps.survey.models import PlanningUnitAnswer


class PlanningUnit(object):
    def set_id(self, id, incomplete=False):
        self.id = id
        self.projects = self.get_projects(incomplete)

    def get_projects(self, incomplete=False):
        out = []
        puas = PlanningUnitAnswer.objects.filter(unit=self.id)
        if not incomplete:
            puas = puas.filter(response__respondant__complete=True)
        
        uuids = puas.values('response__respondant').distinct()
        for obj in uuids:
            uuid = obj['response__respondant']
            ans = puas.filter(response__respondant=uuid )

            # Build the ecosystem feaures list from mutiply answers on the same unit.
            ecosystem_features = []
            for a in ans:
                
                ecosystem_features.append(a.ecosystem_feature)

            proj = {'project_name': ans[0].respondant.project_name,
                    'project_uuid': uuid,
                    'ecosystem_features': ecosystem_features,
                }

            out.append(proj)
        return out


class PlanningUnitResource(Resource):
    """

    /api/v1/panning-unit/

    Returns a PlanningUnit with all Projects and ecotsystem features grouped. 
    """
    id = fields.IntegerField(attribute='id')
    projects = fields.ListField(attribute='projects')

    def detail_uri_kwargs(self, bundle_or_obj):
        kwargs = {}

        if isinstance(bundle_or_obj, Bundle):
            kwargs['pk'] = bundle_or_obj.obj.id
        else:
            kwargs['pk'] = bundle_or_obj.id

        return kwargs

    def get_object_list(self, request):
        qs = PlanningUnitAnswer.objects.all()
        out = []
        for obj in qs:
            pu = PlanningUnit()
            pu.set_id(obj.unit)
            out.append(pu)
        return out


    def obj_get_list(self, bundle, **kwargs):
        # Filtering disabled for brevity...
        return self.get_object_list(bundle.request)

    def obj_get(self, bundle, **kwargs):
        
        pu = PlanningUnit()
        pu.set_id(kwargs['pk'], bundle.request.user.is_staff)
        return pu


    class Meta:
        resource_name = "planning-unit"
        object_class = PlanningUnit
        authorization = Authorization()