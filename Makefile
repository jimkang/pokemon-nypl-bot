PROJECTNAME = pokemon-nypl-bot
HOMEDIR = $(shell pwd)
USER = bot
SERVER = smallcatlabs
SSHCMD = ssh $(USER)@$(SERVER)
APPDIR = /opt/$(PROJECTNAME)

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt/ --exclude node_modules/ --exclude image-output/
	$(SSHCMD) "cd $(APPDIR) && npm install"

# check-log:
	# $(SSHCMD) "journalctl -r -u $(PROJECTNAME)"

run-multiple:
	number=1 ; while [[ $$number -le 10 ]] ; do \
		node pokemon-nypl-bot-post.js --dry; \
		((number = number + 1)) ; \
	done

# Experimentation targets.
# Set the NYPLTOKEN environment variable before running these.
AUTHCURL = curl -H 'Authorization: Token token=$(NYPLTOKEN)'

try-getting-collection-items:
	$(AUTHCURL) http://api.repo.nypl.org/api/v1/items/a3e1e960-33d7-0133-8ff6-00505686a51c.xml

try-item-details:
	$(AUTHCURL) http://api.repo.nypl.org/api/v1/items/item_details/5e67f780-c52a-012f-57b6-3c075448cc4b.xml

try-collection-metadata:
	$(AUTHCURL) http://api.repo.nypl.org/api/v1/items/mods/d6458ca0-33db-0133-3da9-58d385a7b928 | json

# Current winner:
try-item-captures:
	$(AUTHCURL) http://api.repo.nypl.org/api/v1/items/f4469970-c539-012f-e50d-58d385a7bc34.xml
