import json

from django.core.management.base import BaseCommand, CommandError

from survey.models import Respondant


"""
[{"text":"Rocky Intertidal Ecosystems","isGroupName":False,"checked":True,"label":"rocky-intertidal-ecosystems"},
{"text":"Kelp and Shallow (0-30m) Rock Ecosystems","isGroupName":False,"checked":True,"label":"kelp-and-shallow-0-30m-rock-ecosystems"},
{"text":"Mid depth (30-100m) Rock Ecosystems","isGroupName":False,"checked":True,"label":"mid-depth-30-100m-rock-ecosystems"},
{"text":"Soft-bottom Intertidal and Beach Ecosystems","isGroupName":False,"checked":True,"label":"soft-bottom-intertidal-and-beach-ecosystems"},
{"text":"Soft bottom Subtidal (0-100m) Ecosystems","isGroupName":False,"checked":True,"label":"soft-bottom-subtidal-0-100m-ecosystems"},
{"text":"Deep Ecosystems and Canyons (>100m)","isGroupName":False,"checked":True,"label":"deep-ecosystems-and-canyons-100m"},
{"text":"Nearshore Pelagic Ecosystems","isGroupName":False,"checked":True,"label":"nearshore-pelagic-ecosystems"},
{"text":"Consumptive Uses","isGroupName":False,"checked":True,"label":"consumptive-uses"},
{"text":"Non-consumptive Uses","isGroupName":False,"checked":True,"label":"non-consumptive-uses"},
{"text":"Estuarine and Wetland Ecosystems", "isGroupName": False, "checked": True, "label": "estuarine-and-wetland-ecosystems"}

"""


class Command(BaseCommand):
    help = 'Save All Responses'

    def handle(self, *args, **options):


        # Monitoring Commercial Landing Data in California
        respondent = Respondant.objects.get(pk="cbdb7c1a-900b-4634-ad0b-e429441e122f")
        response = respondent.responses.filter(question__slug="ecosystem-features")
        print "Fixing %s" %(respondent.project_name)
        if response:
            response = response[0]
            answer = [
                {"text":"Rocky Intertidal Ecosystems","isGroupName":False,"checked":True,"label":"rocky-intertidal-ecosystems"},
                {"text":"Kelp and Shallow (0-30m) Rock Ecosystems","isGroupName":False,"checked":True,"label":"kelp-and-shallow-0-30m-rock-ecosystems"},
                {"text":"Mid depth (30-100m) Rock Ecosystems","isGroupName":False,"checked":True,"label":"mid-depth-30-100m-rock-ecosystems"},
                {"text":"Soft bottom Subtidal (0-100m) Ecosystems","isGroupName":False,"checked":True,"label":"soft-bottom-subtidal-0-100m-ecosystems"},
                {"text":"Soft-bottom Intertidal and Beach Ecosystems","isGroupName":False,"checked":True,"label":"soft-bottom-intertidal-and-beach-ecosystems"},
                {"text":"Deep Ecosystems and Canyons (>100m)","isGroupName":False,"checked":True,"label":"deep-ecosystems-and-canyons-100m"},
                {"text":"Nearshore Pelagic Ecosystems","isGroupName":False,"checked":True,"label":"nearshore-pelagic-ecosystems"},
                {"text":"Estuarine and Wetland Ecosystems", "isGroupName": False, "checked": True, "label": "estuarine-and-wetland-ecosystems"}
            ]

            response.answer_raw = json.dumps(answer)
            response.save()

            
        # CA Commercial Grounfish Port Sampling 
        respondent = Respondant.objects.get(pk="84a1243b-3c64-4fd9-b4d6-7039e6dfa2f4")
        response = respondent.responses.filter(question__slug="ecosystem-features")
        print "Fixing %s" %(respondent.project_name)
        if response:
            response = response[0]
            answer = [
                {"text":"Consumptive Uses","isGroupName":False,"checked":True,"label":"consumptive-uses"},
                {"text":"Kelp and Shallow (0-30m) Rock Ecosystems","isGroupName":False,"checked":True,"label":"kelp-and-shallow-0-30m-rock-ecosystems"},
            ]

            response.answer_raw = json.dumps(answer)
            response.save()

        

